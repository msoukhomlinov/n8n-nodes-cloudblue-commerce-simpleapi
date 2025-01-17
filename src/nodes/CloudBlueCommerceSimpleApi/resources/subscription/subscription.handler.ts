/**
 * @file Subscription Resource Handler
 * @description Handles subscription resource operations for the CloudBlue Commerce API.
 *
 * Implements the following operations:
 * - Get subscription by ID
 * - Get multiple subscriptions with filtering
 * - Update subscription details
 *
 * Features:
 * - Singleton pattern for consistent state management
 * - Comprehensive error handling with correlation IDs
 * - Input validation through dedicated validator
 * - Pagination support for list operations
 * - Date handling utilities for filtering
 *
 * @module CloudBlueCommerceSimpleApi/resources/subscription
 */

import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import type {
  ISubscription,
  ISubscriptionDetailed,
  ISubscriptionUpdate,
  ISubscriptionProductUpdate,
} from './subscription.types';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';
import { getMany } from '../../utils/pagination';
import { convertRelativeDate, formatDateToYYYYMMDD } from '../../utils/dateConverter';
import type { IDateFilter, ISubscriptionFilter } from '../../interfaces/filters';
import { SubscriptionValidator } from './subscription.validator';
import { PAGINATION } from '../../utils/constants';

export class SubscriptionHandler {
  private static instance: SubscriptionHandler;
  private readonly apiService: CloudBlueApiService;
  private readonly validator: SubscriptionValidator;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
    this.validator = SubscriptionValidator.getInstance(apiService);
  }

  /**
   * Gets or creates the singleton instance of SubscriptionHandler
   * @param apiService - The CloudBlue API service instance
   * @returns The singleton instance of SubscriptionHandler
   */
  public static getInstance(apiService: CloudBlueApiService): SubscriptionHandler {
    if (!SubscriptionHandler.instance) {
      SubscriptionHandler.instance = new SubscriptionHandler(apiService);
    }
    return SubscriptionHandler.instance;
  }

  /**
   * Executes subscription operations based on the provided operation type
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param operation - The operation to execute (get, getMany, update)
   * @param i - The index of the current item being processed
   * @returns Promise resolving to the operation result
   * @throws Error if operation fails or is not supported
   */
  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', `Executing ${operation}`, { i });

    try {
      switch (operation) {
        case 'getMany':
          return await this.getMany(executeFunctions, i);
        case 'get':
          return await this.get(executeFunctions, i);
        case 'update':
          return await this.update(executeFunctions, i);
        default:
          throw new Error(`Operation ${operation} not supported`);
      }
    } catch (error: any) {
      debugLog('RESOURCE_EXEC', 'Error in subscription operation', { operation, error });

      // Extract correlation ID if available
      const correlationId = error.error?.correlationId;
      const errorMessage = error.error?.message || error.message;
      const errorPrefix = correlationId ? `[Correlation ID: ${correlationId}] ` : '';

      // Handle specific error cases with standardized messages
      if (
        error.httpCode === 404 ||
        (error.httpCode === 400 && errorMessage.includes('No entity has been found'))
      ) {
        throw new Error(`${errorPrefix}Subscription not found: ${errorMessage}`);
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
   * Retrieves multiple subscriptions with filtering and pagination support
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param i - The index of the current item being processed
   * @returns Promise resolving to an array of subscriptions
   * @throws Error if the operation fails
   */
  private async getMany(executeFunctions: IExecuteFunctions, i: number): Promise<ISubscription[]> {
    const params: ISubscriptionFilter = {};

    // Handle pagination parameters
    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    params.limit = returnAll
      ? PAGINATION.MAX_LIMIT
      : (executeFunctions.getNodeParameter('limit', i) as number);
    if (!returnAll) {
      params.offset = executeFunctions.getNodeParameter('offset', i, 0) as number;
    }

    // Handle date filters
    const filters = executeFunctions.getNodeParameter('filters', i, {}) as IDataObject;

    if (filters.creationDateFrom) {
      const creationDateFrom = filters.creationDateFrom as IDateFilter;
      if (creationDateFrom.presetDate?.preset) {
        params.creationDateFrom = formatDateToYYYYMMDD(
          convertRelativeDate(creationDateFrom.presetDate.preset).toISOString(),
        );
      } else if (creationDateFrom.datePicker?.date) {
        params.creationDateFrom = formatDateToYYYYMMDD(creationDateFrom.datePicker.date);
      }
    }

    if (filters.creationDateTo) {
      const creationDateTo = filters.creationDateTo as IDateFilter;
      if (creationDateTo.presetDate?.preset) {
        params.creationDateTo = formatDateToYYYYMMDD(
          convertRelativeDate(creationDateTo.presetDate.preset).toISOString(),
        );
      } else if (creationDateTo.datePicker?.date) {
        params.creationDateTo = formatDateToYYYYMMDD(creationDateTo.datePicker.date);
      }
    }

    debugLog('RESOURCE_EXEC', 'Getting subscriptions with params', params);
    return await getMany<ISubscription>(
      executeFunctions,
      this.apiService,
      '/subscriptions',
      i,
      params,
    );
  }

  /**
   * Get a subscription by ID
   */
  private async get(
    executeFunctions: IExecuteFunctions,
    i: number,
  ): Promise<ISubscriptionDetailed> {
    this.validator.validateGetOperation(executeFunctions, i);
    const subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;

    debugLog('RESOURCE_EXEC', 'Getting subscription by ID', { subscriptionId });

    const response = await this.apiService.get<ISubscriptionDetailed>(
      `/subscriptions/${subscriptionId}`,
    );

    if (!response?.data) {
      throw new Error('Failed to retrieve subscription: No data received from API');
    }

    return response.data;
  }

  /**
   * Update a subscription
   */
  private async update(
    executeFunctions: IExecuteFunctions,
    i: number,
  ): Promise<ISubscriptionDetailed> {
    this.validator.validateUpdateOperation(executeFunctions, i);

    const subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;
    const updateData = executeFunctions.getNodeParameter('data', i) as IDataObject;

    debugLog('RESOURCE_EXEC', 'Updating subscription', { subscriptionId, updateData });

    const updateBody: ISubscriptionUpdate = {};

    // Only allow updates to fields that are updatable according to the API schema
    if (updateData.products) {
      // Validate product updates
      const products = updateData.products as ISubscriptionProductUpdate[];
      updateBody.products = products.map((product) => {
        const validatedProduct: ISubscriptionProductUpdate = {};

        if (product.mpn !== undefined) validatedProduct.mpn = product.mpn;
        if (product.id !== undefined) validatedProduct.id = product.id;
        if (product.unitPrice !== undefined) validatedProduct.unitPrice = product.unitPrice;
        if (product.unitCost !== undefined) validatedProduct.unitCost = product.unitCost;
        if (product.unitProviderCost !== undefined)
          validatedProduct.unitProviderCost = product.unitProviderCost;

        return validatedProduct;
      });
    }

    if (updateData.attributes) {
      // Validate attributes is a string record
      const attributes = updateData.attributes as Record<string, unknown>;
      updateBody.attributes = Object.entries(attributes).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);
    }

    if ('renewalStatus' in updateData) {
      // Ensure renewalStatus is boolean
      updateBody.renewalStatus = Boolean(updateData.renewalStatus);
    }

    debugLog('RESOURCE_EXEC', 'Update body prepared', updateBody);

    const response = await this.apiService.patch<ISubscriptionDetailed>(
      `/subscriptions/${subscriptionId}`,
      updateBody,
    );

    if (!response?.data) {
      throw new Error('Failed to update subscription: No data received from API');
    }

    return response.data;
  }

  public async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    debugLog('RESOURCE_EXEC', 'Loading options', { propertyName, currentParameters });
    return [];
  }
}
