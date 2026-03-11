/**
 * @file Order Resource Handler
 * @description Handles order resource operations for the CloudBlue Commerce API.
 *
 * Implements the following operations:
 * - Get order by ID
 * - Get multiple orders with filtering
 * - Create new order
 * - Estimate order price
 * - Get reseller orders
 * - Update order properties and status
 *
 * Features:
 * - Singleton pattern for consistent state management
 * - Comprehensive error handling with correlation IDs
 * - Input validation through dedicated validator
 * - Pagination support for list operations
 * - Advanced filtering with date range support
 *
 * @module CloudBlueCommerceSimpleApi/resources/order
 */

import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import type { IOrder, IOrderListResponse, IOrderFilter, IOrderUpdate } from './order.types';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';
import { convertRelativeDate } from '../../utils/dateConverter';
import { formatToDateTime, formatToDate } from '../../utils/dateValidator';
import type { IDateFilter } from '../../interfaces/filters';
import { OrderValidator } from './order.validator';
import { getMany } from '../../utils/pagination';

export class OrderHandler {
  private static instance: OrderHandler;
  private readonly apiService: CloudBlueApiService;
  private readonly validator: OrderValidator;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
    this.validator = OrderValidator.getInstance();
  }

  public static getInstance(apiService: CloudBlueApiService): OrderHandler {
    if (!OrderHandler.instance) {
      OrderHandler.instance = new OrderHandler(apiService);
    }
    return OrderHandler.instance;
  }

  /**
   * Get a plan by ID
   */
  private async get(executeFunctions: IExecuteFunctions, i: number): Promise<IOrder> {
    this.validator.validateGetOperation(executeFunctions, i);

    const orderId = executeFunctions.getNodeParameter('orderId', i) as string;
    debugLog('RESOURCE_EXEC', 'Getting order by ID', { orderId });

    const response = await this.apiService.get<IOrder>(`/orders/${orderId}`);

    if (!response?.data) {
      throw new Error(`Failed to get order: No data received from API`);
    }

    return response.data;
  }

  /**
   * Get many orders with pagination
   */
  private async getMany(executeFunctions: IExecuteFunctions, i: number): Promise<IOrder[]> {
    this.validator.validateGetManyOperation(executeFunctions, i);

    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    const filters = executeFunctions.getNodeParameter('filters', i, {}) as IOrderFilter;

    // Format date filters to match API requirements
    if (filters.creationTimeFrom) {
      const fromDate = this.getDateFromFilter(filters.creationTimeFrom as unknown as IDateFilter);
      if (fromDate) {
        filters.creationTimeFrom = formatToDateTime(fromDate);
      }
    }

    if (filters.creationTimeTo) {
      const toDate = this.getDateFromFilter(filters.creationTimeTo as unknown as IDateFilter);
      if (toDate) {
        filters.creationTimeTo = formatToDateTime(toDate);
      }
    }

    // Handle pagination
    if (!returnAll) {
      filters.limit = executeFunctions.getNodeParameter('limit', i) as number;
    }

    debugLog('RESOURCE_EXEC', 'Getting orders with filters', { filters });

    return await getMany<IOrder>(executeFunctions, this.apiService, '/orders', i, filters);
  }

  /**
   * Create a new order
   */
  private async create(executeFunctions: IExecuteFunctions, i: number): Promise<IOrder> {
    this.validator.validateCreateOperation(executeFunctions, i);

    const orderData = executeFunctions.getNodeParameter('data', i) as IOrder;

    // Format dates according to API specification
    if (orderData.startDate) {
      orderData.startDate = formatToDate(new Date(orderData.startDate));
    }
    if (orderData.migrationDate) {
      orderData.migrationDate = formatToDate(new Date(orderData.migrationDate));
    }
    if (orderData.expirationDate) {
      orderData.expirationDate = formatToDate(new Date(orderData.expirationDate));
    }
    if (orderData.lastBillingDate) {
      orderData.lastBillingDate = formatToDate(new Date(orderData.lastBillingDate));
    }
    if (orderData.nextBillingDate) {
      orderData.nextBillingDate = formatToDate(new Date(orderData.nextBillingDate));
    }
    if (orderData.scheduledOn) {
      orderData.scheduledOn = formatToDateTime(new Date(orderData.scheduledOn));
    }

    debugLog('RESOURCE_EXEC', 'Creating order', { orderData });

    const response = await this.apiService.request<IOrder>({
      method: 'POST',
      url: '/orders',
      data: orderData,
    });

    if (!response?.data) {
      throw new Error(`Failed to create order: No data received from API`);
    }

    return response.data;
  }

  /**
   * Gets date from filter
   */
  private getDateFromFilter(filter: IDateFilter): Date | null {
    if (filter.presetDate?.preset) {
      return convertRelativeDate(filter.presetDate.preset);
    }
    if (filter.datePicker?.date) {
      return new Date(filter.datePicker.date);
    }
    return null;
  }

  /**
   * Execute the specified operation
   */
  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', 'Executing order operation', { operation, i });

    try {
      switch (operation) {
        case 'get':
          return await this.get(executeFunctions, i);
        case 'getMany':
          return await this.getMany(executeFunctions, i);
        case 'create':
          return await this.create(executeFunctions, i);
        default:
          throw new Error(`Operation ${operation} is not supported`);
      }
    } catch (error: unknown) {
      debugLog('RESOURCE_EXEC', 'Error in order operation', { operation, error });

      // Extract correlation ID if available
      let correlationId, errorMessage;
      if (error instanceof Error) {
        correlationId = (error as any).error?.correlationId;
        errorMessage = (error as any).error?.message || error.message;
      } else {
        errorMessage = String(error);
      }
      const errorPrefix = correlationId ? `[Correlation ID: ${correlationId}] ` : '';

      // Handle specific error cases with standardized messages
      if (error instanceof Error) {
        const httpCode = (error as any).httpCode;
        if (
          httpCode === 404 ||
          (httpCode === 400 && errorMessage.includes('No entity has been found'))
        ) {
          throw new Error(`${errorPrefix}Order not found: ${errorMessage}`);
        }
        if (httpCode === 400) {
          throw new Error(`${errorPrefix}Invalid request: ${errorMessage}`);
        }
        if (httpCode === 401) {
          throw new Error(`${errorPrefix}Authentication failed: ${errorMessage}`);
        }
        if (httpCode === 403) {
          throw new Error(`${errorPrefix}Access denied: ${errorMessage}`);
        }
        if (httpCode === 409) {
          throw new Error(`${errorPrefix}Conflict: ${errorMessage}`);
        }
        if (httpCode === 429) {
          throw new Error(`${errorPrefix}Rate limit exceeded: ${errorMessage}`);
        }
        if (httpCode === 500) {
          throw new Error(`${errorPrefix}Internal server error: ${errorMessage}`);
        }
        if (httpCode === 503) {
          throw new Error(`${errorPrefix}Service unavailable: ${errorMessage}`);
        }
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
    // Currently, there are no dynamic options to load for the order resource
    return [];
  }
}
