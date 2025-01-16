/**
 * @file Subscription Resource Handler
 * @description Handles all subscription-related operations for the CloudBlue Connect API.
 * Implements:
 * - CRUD operations for subscriptions
 * - Dynamic option loading for subscription fields
 * - Response transformation and validation
 *
 * Uses singleton pattern to maintain consistent state and API service access.
 *
 * @module CloudBlueConnectSimpleApi/resources/subscription/handler
 */

import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import type {
  ISubscription,
  ISubscriptionListResponse,
  ISubscriptionDetailed,
  ISubscriptionUpdate,
  ISubscriptionProductUpdate,
} from './subscription.types';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';
import { getMany } from '../../utils/pagination';
import { convertRelativeDate, formatDateToYYYYMMDD } from '../../utils/dateConverter';
import type { IDateFilter, ISubscriptionFilter } from '../../interfaces/filters';
import { PAGINATION } from '../../utils/constants';

export class SubscriptionHandler {
  private static instance: SubscriptionHandler;
  private readonly apiService: CloudBlueApiService;

  private constructor(apiService: CloudBlueApiService) {
    this.apiService = apiService;
  }

  public static getInstance(apiService: CloudBlueApiService): SubscriptionHandler {
    if (!SubscriptionHandler.instance) {
      SubscriptionHandler.instance = new SubscriptionHandler(apiService);
    }
    return SubscriptionHandler.instance;
  }

  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', `Executing ${operation}`, { i });

    if (operation === 'getMany') {
      const params: ISubscriptionFilter = {};

      // Get filters collection
      const filters = executeFunctions.getNodeParameter('params', i, {}) as IDataObject;
      debugLog('RESOURCE_EXEC', 'Retrieved filters', filters);

      // Map filters to API parameters
      if (filters.status) {
        params.status = filters.status as ISubscriptionFilter['status'];
      }

      if (filters.customerId) {
        params.customerId = filters.customerId as string;
      }

      if (filters.creationDateFrom) {
        const creationDateFrom = filters.creationDateFrom as IDateFilter;
        debugLog('RESOURCE_EXEC', 'creationDateFrom value', creationDateFrom);
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
        debugLog('RESOURCE_EXEC', 'creationDateTo value', creationDateTo);
        if (creationDateTo.presetDate?.preset) {
          params.creationDateTo = formatDateToYYYYMMDD(
            convertRelativeDate(creationDateTo.presetDate.preset).toISOString(),
          );
        } else if (creationDateTo.datePicker?.date) {
          params.creationDateTo = formatDateToYYYYMMDD(creationDateTo.datePicker.date);
        }
      }

      // Handle pagination parameters
      const limit = executeFunctions.getNodeParameter(
        'limit',
        i,
        PAGINATION.DEFAULT_LIMIT,
      ) as number;
      const offset = executeFunctions.getNodeParameter('offset', i, 0) as number;
      params.limit = limit;
      params.offset = offset;

      debugLog('RESOURCE_EXEC', 'Final params for getMany', params);
      return await getMany<ISubscription>(
        executeFunctions,
        this.apiService,
        '/subscriptions',
        i,
        params,
      );
    }

    if (operation === 'get') {
      const subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;

      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      debugLog('RESOURCE_EXEC', 'Getting subscription by ID', { subscriptionId });

      const response = await this.apiService.get<ISubscriptionDetailed>(
        `/subscriptions/${subscriptionId}`,
      );

      if (!response?.data) {
        throw new Error('No data received from API');
      }

      return response.data;
    }

    if (operation === 'update') {
      const subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;
      const updateData = executeFunctions.getNodeParameter('data', i) as IDataObject;

      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }

      debugLog('RESOURCE_EXEC', 'Updating subscription', { subscriptionId, updateData });

      const updateBody: ISubscriptionUpdate = {};

      // Only allow updates to fields that are updatable according to the API schema
      if (updateData.products) {
        // Validate product updates
        const products = updateData.products as ISubscriptionProductUpdate[];
        if (!Array.isArray(products)) {
          throw new Error('Products must be an array');
        }

        // Validate each product update
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
        throw new Error('No data received from API');
      }

      return response.data;
    }

    throw new Error(`Operation ${operation} not supported`);
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
