/**
 * @file Customer Resource Handler
 * @description Implements customer resource operations
 * Implements:
 * - Create customer
 * - Get customer
 * - Get many customers
 * - Update customer
 *
 * @module CloudBlueConnectSimpleApi/resources/customer
 */

import type {
  IExecuteFunctions,
  IDataObject,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { CustomerValidator } from './customer.validator';
import type { ICustomer, ICustomerListResponse } from './customer.types';
import { getMany } from '../../utils/pagination';
import { debugLog } from '../../utils/debug';

export class CustomerHandler {
  private static instance: CustomerHandler;
  private readonly apiService: CloudBlueApiService;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
  }

  public static getInstance(apiService: CloudBlueApiService): CustomerHandler {
    if (!CustomerHandler.instance) {
      CustomerHandler.instance = new CustomerHandler(apiService);
    }
    return CustomerHandler.instance;
  }

  /**
   * Execute customer operations
   */
  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', `Executing customer ${operation} operation`);

    switch (operation) {
      case 'create':
        return this.create(executeFunctions, i);
      case 'get':
        return this.get(executeFunctions, i);
      case 'getMany':
        return this.getMany(executeFunctions, i);
      case 'update':
        return this.update(executeFunctions, i);
      default:
        throw new Error(`Operation ${operation} not supported`);
    }
  }

  /**
   * Load dynamic options for customer resource
   */
  public async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    // Currently no dynamic options needed for customer resource
    return [];
  }

  /**
   * Create a new customer
   */
  private async create(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer> {
    const customer = CustomerValidator.validateCreate(executeFunctions, i);
    const response = await this.apiService.request<ICustomer>({
      method: 'POST',
      url: '/customers',
      data: customer,
    });
    return response.data;
  }

  /**
   * Get a customer by ID
   */
  private async get(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer> {
    const id = executeFunctions.getNodeParameter('id', i) as string;
    const response = await this.apiService.request<ICustomer>({
      method: 'GET',
      url: `/customers/${id}`,
    });
    return response.data;
  }

  /**
   * Get many customers with filtering and pagination
   */
  private async getMany(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer[]> {
    const filters = CustomerValidator.validateGetMany(executeFunctions, i);
    return getMany<ICustomer>(executeFunctions, this.apiService, '/customers', i, filters);
  }

  /**
   * Update a customer
   */
  private async update(executeFunctions: IExecuteFunctions, i: number): Promise<ICustomer> {
    const id = executeFunctions.getNodeParameter('id', i) as string;
    const updateData = CustomerValidator.validateUpdate(executeFunctions, i);
    const response = await this.apiService.request<ICustomer>({
      method: 'PATCH',
      url: `/customers/${id}`,
      data: updateData,
    });
    return response.data;
  }
}
