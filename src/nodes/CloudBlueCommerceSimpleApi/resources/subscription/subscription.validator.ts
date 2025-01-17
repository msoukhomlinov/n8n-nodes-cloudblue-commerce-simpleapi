/**
 * @file Subscription Resource Validator
 * @description Handles validation for subscription resource operations in the CloudBlue Commerce API.
 *
 * Implements validation for:
 * - Get operation parameters
 * - Get many operation filters
 * - Update operation data validation
 * - Status validation
 * - Product data validation
 *
 * Features:
 * - Singleton pattern for consistent validation rules
 * - Comprehensive input validation
 * - Type checking and data structure validation
 * - Status enumeration validation
 * - Product structure validation
 *
 * @module CloudBlueCommerceSimpleApi/resources/subscription
 */

import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import type { ISubscriptionFilter } from '../../interfaces/filters';
import { SubscriptionStatus } from './subscription.types';
import { debugLog } from '../../utils/debug';
import { PAGINATION } from '../../utils/constants';

export class SubscriptionValidator {
  private static instance: SubscriptionValidator;
  private readonly apiService: CloudBlueApiService;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
  }

  public static getInstance(apiService: CloudBlueApiService): SubscriptionValidator {
    if (!SubscriptionValidator.instance) {
      SubscriptionValidator.instance = new SubscriptionValidator(apiService);
    }
    return SubscriptionValidator.instance;
  }

  /**
   * Validate get operation parameters
   */
  public validateGetOperation(executeFunctions: IExecuteFunctions, i: number): void {
    const subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;
    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }
    debugLog('RESOURCE_EXEC', 'Get operation parameters validated', { subscriptionId });
  }

  /**
   * Validate getMany operation parameters and return filter object
   */
  public validateGetManyOperation(
    executeFunctions: IExecuteFunctions,
    i: number,
  ): ISubscriptionFilter {
    const params: ISubscriptionFilter = {};
    const filters = executeFunctions.getNodeParameter('params', i, {}) as IDataObject;

    // Validate status if provided
    if (filters.status) {
      if (!this.isValidStatus(filters.status as string)) {
        throw new Error(`Invalid status value: ${filters.status}`);
      }
      params.status = filters.status as ISubscriptionFilter['status'];
    }

    // Validate customer ID if provided
    if (filters.customerId) {
      if (typeof filters.customerId !== 'string') {
        throw new Error('Customer ID must be a string');
      }
      params.customerId = filters.customerId;
    }

    // Handle pagination parameters
    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    params.limit = returnAll
      ? PAGINATION.MAX_LIMIT
      : (executeFunctions.getNodeParameter('limit', i) as number);
    if (!returnAll) {
      if (params.limit <= 0) {
        throw new Error('Limit must be greater than 0');
      }
      params.offset = executeFunctions.getNodeParameter('offset', i, 0) as number;
    }

    debugLog('RESOURCE_EXEC', 'GetMany operation parameters validated', { params });
    return params;
  }

  /**
   * Validate update operation parameters
   */
  public validateUpdateOperation(executeFunctions: IExecuteFunctions, i: number): void {
    const subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;
    const updateData = executeFunctions.getNodeParameter('data', i) as IDataObject;

    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data is required');
    }

    // Validate products if provided
    if (updateData.products) {
      if (!Array.isArray(updateData.products)) {
        throw new Error('Products must be an array');
      }

      for (const product of updateData.products as IDataObject[]) {
        if (!product.mpn && !product.id) {
          throw new Error('Either MPN or ID must be provided for each product');
        }
      }
    }

    debugLog('RESOURCE_EXEC', 'Update operation parameters validated', {
      subscriptionId,
      updateData,
    });
  }

  /**
   * Helper function to validate subscription status
   */
  private isValidStatus(status: string): boolean {
    return ['active', 'suspended', 'terminated', 'draft'].includes(status);
  }
}
