/**
 * @file Customer Resource Handler
 * @description Handles customer resource operations for the CloudBlue Commerce API.
 *
 * Implements the following operations:
 * - Create new customer
 * - Get customer by ID
 * - Get multiple customers with filtering
 * - Update customer details
 *
 * Features:
 * - Singleton pattern for consistent state management
 * - Comprehensive error handling with correlation IDs
 * - Input validation through dedicated validator
 * - Pagination support for list operations
 * - Filtering capabilities for customer queries
 *
 * @module CloudBlueCommerceSimpleApi/resources/customer
 */

import type {
  IExecuteFunctions,
  IDataObject,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { CustomerValidator } from './customer.validator';
import type { ICustomer, ICustomerFilters } from './customer.types';
import { debugLog } from '../../utils/debug';
import { getMany } from '../../utils/pagination';
import { PAGINATION } from '../../utils/constants';

export class CustomerHandler {
  private static instance: CustomerHandler;
  private readonly apiService: CloudBlueApiService;
  private readonly validator: CustomerValidator;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
    this.validator = CustomerValidator.getInstance(apiService);
  }

  /**
   * Gets or creates the singleton instance of CustomerHandler
   *
   * @param apiService - The CloudBlue API service instance
   * @returns The singleton instance of CustomerHandler
   */
  public static getInstance(apiService: CloudBlueApiService): CustomerHandler {
    if (!CustomerHandler.instance) {
      CustomerHandler.instance = new CustomerHandler(apiService);
    }
    return CustomerHandler.instance;
  }

  /**
   * Executes customer operations based on the provided operation type
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param operation - The operation to execute (create, get, getMany, update)
   * @param i - The index of the current item being processed
   * @returns Promise resolving to the operation result
   * @throws Error if operation fails or is not supported
   */
  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', `Executing customer ${operation} operation`);

    try {
      switch (operation) {
        case 'create':
          return await this.create(executeFunctions, i);
        case 'get':
          return await this.get(executeFunctions, i);
        case 'getMany':
          return await this.getMany(executeFunctions, i);
        case 'update':
          return await this.update(executeFunctions, i);
        default:
          throw new Error(`Operation ${operation} not supported`);
      }
    } catch (error: any) {
      debugLog('RESOURCE_EXEC', 'Error in customer operation', { operation, error });

      // Extract correlation ID if available
      const correlationId = error.error?.correlationId;
      const errorMessage = error.error?.message || error.message;
      const errorPrefix = correlationId ? `[Correlation ID: ${correlationId}] ` : '';

      // Handle specific error cases with standardized messages
      if (
        error.httpCode === 404 ||
        (error.httpCode === 400 && errorMessage.includes('No entity has been found'))
      ) {
        throw new Error(`${errorPrefix}Customer not found: ${errorMessage}`);
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
   * Creates a new customer
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param i - The index of the current item being processed
   * @returns Promise resolving to the created customer
   * @throws Error if the operation fails or validation fails
   */
  private async create(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer> {
    const customer = this.validator.validateCreateOperation(executeFunctions, i);

    debugLog('RESOURCE_EXEC', 'Creating customer', { customer });

    const response = await this.apiService.request<ICustomer>({
      method: 'POST',
      url: '/customers',
      data: customer,
    });

    if (!response?.data) {
      throw new Error('Failed to create customer: No data received from API');
    }

    return response.data;
  }

  /**
   * Retrieves a customer by ID
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param i - The index of the current item being processed
   * @returns Promise resolving to the customer details
   * @throws Error if the customer is not found or operation fails
   */
  private async get(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer> {
    const id = this.validator.validateGetOperation(executeFunctions, i);

    debugLog('RESOURCE_EXEC', 'Getting customer by ID', { id });

    const response = await this.apiService.request<ICustomer>({
      method: 'GET',
      url: `/customers/${id}`,
    });

    if (!response?.data) {
      throw new Error('Failed to retrieve customer: No data received from API');
    }

    return response.data;
  }

  /**
   * Retrieves multiple customers with filtering and pagination support
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param i - The index of the current item being processed
   * @returns Promise resolving to an array of customers
   * @throws Error if the operation fails
   */
  private async getMany(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer[]> {
    const params: ICustomerFilters = {};

    // Handle pagination parameters
    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    params.limit = returnAll
      ? PAGINATION.MAX_LIMIT
      : (executeFunctions.getNodeParameter('limit', i) as number);
    if (!returnAll) {
      params.offset = executeFunctions.getNodeParameter('offset', i, 0) as number;
    }

    // Get and map filters
    const filters = executeFunctions.getNodeParameter('filters', i, {}) as IDataObject;

    // Map filters to API parameters
    if (filters.name) {
      params.name = filters.name as string;
    }

    if (filters.email) {
      params.email = filters.email as string;
    }

    if (filters.externalId) {
      params.externalId = filters.externalId as string;
    }

    if (filters.resellerId) {
      params.resellerId = filters.resellerId as string;
    }

    debugLog('RESOURCE_EXEC', 'Getting customers with filters', { params });
    return await getMany<ICustomer>(executeFunctions, this.apiService, '/customers', i, params);
  }

  /**
   * Updates an existing customer
   *
   * @param executeFunctions - n8n execution functions for parameter handling
   * @param i - The index of the current item being processed
   * @returns Promise resolving to the updated customer
   * @throws Error if the customer is not found or operation fails
   */
  private async update(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer> {
    const id = this.validator.validateGetOperation(executeFunctions, i);
    const updateData = this.validator.validateUpdateOperation(executeFunctions, i);

    debugLog('RESOURCE_EXEC', 'Updating customer', { id, updateData });

    const response = await this.apiService.request<ICustomer>({
      method: 'PATCH',
      url: `/customers/${id}`,
      data: updateData,
    });

    if (!response?.data) {
      throw new Error('Failed to update customer: No data received from API');
    }

    return response.data;
  }

  /**
   * Loads dynamic options for customer-related fields
   *
   * @param loadOptionsFunctions - n8n functions for loading options
   * @param propertyName - The name of the property to load options for
   * @param currentParameters - Current parameter values
   * @returns Promise resolving to the available options
   */
  public async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    debugLog('RESOURCE_EXEC', 'Loading options', { propertyName, currentParameters });
    return [];
  }
}
