/**
 * @file Order Resource Validator
 * @description Handles validation for order resource operations in the CloudBlue Commerce API.
 *
 * Implements validation for:
 * - Get operation parameters
 * - Get many operation filters
 * - Create operation parameters
 * - Estimate operation parameters
 * - Get reseller orders parameters
 * - Order status validation
 * - Date range validation
 * - Subscription period validation
 *
 * Features:
 * - Singleton pattern for consistent validation rules
 * - Comprehensive input validation
 * - Type checking and data structure validation
 * - Date format and range validation
 * - Enumeration value validation
 *
 * @module CloudBlueCommerceSimpleApi/resources/order
 */

import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';
import type { IDateFilter } from '../../interfaces/filters';
import type { IDuration, OrderStatus, IOrder } from './order.types';
import { validateDateFilter, validateDateTime, validateDate } from '../../utils/dateValidator';

export class OrderValidator {
  private static instance: OrderValidator;

  private constructor() {}

  public static getInstance(): OrderValidator {
    if (!OrderValidator.instance) {
      OrderValidator.instance = new OrderValidator();
    }
    return OrderValidator.instance;
  }

  /**
   * Validates get operation parameters
   */
  public validateGetOperation(executeFunctions: IExecuteFunctions, i: number): void {
    debugLog('RESOURCE_EXEC', 'Validating get operation parameters');

    const orderId = executeFunctions.getNodeParameter('orderId', i) as string;
    if (!orderId) {
      throw new Error('Order ID is required');
    }
  }

  /**
   * Validates getMany operation parameters and filters
   */
  public validateGetManyOperation(executeFunctions: IExecuteFunctions, i: number): void {
    debugLog('RESOURCE_EXEC', 'Validating getMany operation parameters');

    // Validate pagination parameters
    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    if (!returnAll) {
      const limit = executeFunctions.getNodeParameter('limit', i) as number;
      if (typeof limit !== 'number' || limit < 1) {
        throw new Error('Limit must be a positive number');
      }

      const offset = executeFunctions.getNodeParameter('offset', i, 0) as number;
      if (typeof offset !== 'number' || offset < 0) {
        throw new Error('Offset must be a non-negative number');
      }
    }

    // Validate filters
    const filters = executeFunctions.getNodeParameter('filters', i, {}) as {
      [key: string]: any;
    };

    // Validate status if provided
    if (filters.status) {
      this.validateOrderStatus(filters.status as OrderStatus);
    }

    // Validate date filters
    if (filters.creationTimeFrom) {
      validateDateFilter(filters.creationTimeFrom, 'Creation time from', true);
    }

    if (filters.creationTimeTo) {
      validateDateFilter(filters.creationTimeTo, 'Creation time to', true);
    }

    // Validate date range if both dates are provided
    if (filters.creationTimeFrom && filters.creationTimeTo) {
      const fromDate = this.getDateFromFilter(filters.creationTimeFrom);
      const toDate = this.getDateFromFilter(filters.creationTimeTo);

      if (fromDate && toDate && fromDate > toDate) {
        throw new Error('Creation time from must be before creation time to');
      }
    }
  }

  /**
   * Validates order status
   */
  private validateOrderStatus(status: OrderStatus): void {
    const validStatuses = ['submitted', 'processing', 'error', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid order status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
      );
    }
  }

  /**
   * Validates subscription period
   */
  private validateSubscriptionPeriod(period: IDuration): void {
    const validTypes = ['day', 'month', 'year', 'statement_day', 'unknown'];
    if (!validTypes.includes(period.type)) {
      throw new Error(
        `Invalid period type: ${period.type}. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    if (typeof period.duration !== 'number' || period.duration <= 0) {
      throw new Error('Period duration must be a positive number');
    }
  }

  /**
   * Gets date from filter
   */
  private getDateFromFilter(filter: IDateFilter): Date | null {
    if (filter.presetDate?.preset) {
      return new Date(filter.presetDate.preset);
    }
    if (filter.datePicker?.date) {
      return new Date(filter.datePicker.date);
    }
    return null;
  }

  /**
   * Validates create operation parameters
   */
  public validateCreateOperation(executeFunctions: IExecuteFunctions, i: number): void {
    debugLog('RESOURCE_EXEC', 'Validating create operation parameters');
    const orderData = executeFunctions.getNodeParameter('data', i) as IOrder;

    if (!orderData) {
      throw new Error('Order data is required');
    }

    if (!orderData.customerId) {
      throw new Error('Customer ID is required');
    }

    if (
      !orderData.products ||
      !Array.isArray(orderData.products) ||
      orderData.products.length === 0
    ) {
      throw new Error('At least one product is required');
    }

    // Validate each product
    orderData.products.forEach((product, index) => {
      if (!product.mpn) {
        throw new Error(`Product at index ${index} must have an MPN`);
      }
      if (typeof product.quantity !== 'number' || product.quantity <= 0) {
        throw new Error(`Product at index ${index} must have a positive quantity`);
      }
    });

    // Validate dates if provided
    if (orderData.startDate) {
      validateDate(orderData.startDate, 'Start date');
    }
    if (orderData.migrationDate) {
      validateDate(orderData.migrationDate, 'Migration date');
    }
    if (orderData.expirationDate) {
      validateDate(orderData.expirationDate, 'Expiration date');
    }
    if (orderData.lastBillingDate) {
      validateDate(orderData.lastBillingDate, 'Last billing date');
    }
    if (orderData.nextBillingDate) {
      validateDate(orderData.nextBillingDate, 'Next billing date');
    }
    if (orderData.scheduledOn) {
      validateDateTime(orderData.scheduledOn, 'Scheduled on');
    }
  }
}
