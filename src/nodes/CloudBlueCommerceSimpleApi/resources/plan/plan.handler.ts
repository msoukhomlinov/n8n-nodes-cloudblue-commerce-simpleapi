/**
 * @file Plan Resource Handler
 * @description Implementation of Plan resource operations
 * Implements:
 * - Get plan by ID
 * - Get many plans with pagination
 *
 * @module CloudBlueCommerceSimpleApi/resources/plan
 */

import type {
  IExecuteFunctions,
  IDataObject,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { PlanValidator } from './plan.validator';
import type { IPlan, IPlanDetailed, IPlanFilter, IResultListServicePlan } from './plan.types';
import { debugLog } from '../../utils/debug';
import { getMany } from '../../utils/pagination';

export class PlanHandler {
  private static instance: PlanHandler;
  private readonly apiService: CloudBlueApiService;
  private readonly validator: PlanValidator;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
    this.validator = PlanValidator.getInstance();
  }

  public static getInstance(apiService: CloudBlueApiService): PlanHandler {
    if (!PlanHandler.instance) {
      PlanHandler.instance = new PlanHandler(apiService);
    }
    return PlanHandler.instance;
  }

  /**
   * Get a plan by ID
   */
  private async get(executeFunctions: IExecuteFunctions, i: number): Promise<IPlanDetailed> {
    this.validator.validateGetOperation(executeFunctions, i);

    const planId = executeFunctions.getNodeParameter('id', i) as string;
    debugLog('RESOURCE_EXEC', 'Getting plan by ID', { planId });

    const response = await this.apiService.get<IPlanDetailed>(`/plans/${planId}`);

    if (!response?.data) {
      throw new Error(`Failed to get plan: No data received from API`);
    }

    return response.data;
  }

  /**
   * Get many plans with pagination
   */
  private async getMany(executeFunctions: IExecuteFunctions, i: number): Promise<IPlan[]> {
    this.validator.validateGetManyOperation(executeFunctions, i);

    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    const params: IPlanFilter = {};

    // Handle pagination
    if (!returnAll) {
      params.limit = executeFunctions.getNodeParameter('limit', i) as number;
    }

    debugLog('RESOURCE_EXEC', 'Getting plans with params', { params });

    return await getMany<IPlan>(executeFunctions, this.apiService, '/plans', i, params);
  }

  /**
   * Execute the specified operation
   */
  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', 'Executing plan operation', { operation, i });

    try {
      this.validator.validateOperation(operation, executeFunctions, i);

      switch (operation) {
        case 'get':
          return await this.get(executeFunctions, i);
        case 'getMany':
          return await this.getMany(executeFunctions, i);
        default:
          throw new Error(`Operation ${operation} is not supported`);
      }
    } catch (error: any) {
      debugLog('RESOURCE_EXEC', 'Error in plan operation', { operation, error });

      // Extract correlation ID if available
      const correlationId = error.error?.correlationId;
      const errorMessage = error.error?.message || error.message;
      const errorPrefix = correlationId ? `[Correlation ID: ${correlationId}] ` : '';

      // Handle specific error cases with standardized messages
      if (
        error.httpCode === 404 ||
        (error.httpCode === 400 && errorMessage.includes('No entity has been found'))
      ) {
        throw new Error(`${errorPrefix}Plan not found: ${errorMessage}`);
      }
      if (error.httpCode === 400) {
        throw new Error(`${errorPrefix}Invalid request: ${errorMessage}`);
      }
      if (error.httpCode === 401) {
        throw new Error(`${errorPrefix}Authentication failed: ${errorMessage}`);
      }
      if (error.httpCode === 403) {
        throw new Error(`${errorPrefix}Access denied: ${errorMessage}`);
      }
      if (error.httpCode === 409) {
        throw new Error(`${errorPrefix}Conflict: ${errorMessage}`);
      }
      if (error.httpCode === 429) {
        throw new Error(`${errorPrefix}Rate limit exceeded: ${errorMessage}`);
      }
      if (error.httpCode === 500) {
        throw new Error(`${errorPrefix}Internal server error: ${errorMessage}`);
      }
      if (error.httpCode === 503) {
        throw new Error(`${errorPrefix}Service unavailable: ${errorMessage}`);
      }

      // For any other error, include as much context as possible
      throw new Error(`${errorPrefix}${errorMessage}`);
    }
  }

  /**
   * Load options for dynamic fields
   */
  public async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    // Currently, there are no dynamic options to load for the plan resource
    return [];
  }
}
