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
} from './subscription.types';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';
import { getMany } from '../../utils/pagination';
import { convertRelativeDate, formatDateToYYYYMMDD } from '../../utils/dateConverter';
import type { IDateFilter } from '../../interfaces/filters';

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
      const params: IDataObject = {};

      // Get filters collection
      const filters = executeFunctions.getNodeParameter('params', i, {}) as IDataObject;
      debugLog('RESOURCE_EXEC', 'Retrieved filters', filters);

      // Map filters to API parameters
      if (filters.status) {
        params.status = filters.status;
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

      if (filters.product_id) {
        params.productId = filters.product_id;
      }

      if (filters.marketplace_id) {
        params.marketplaceId = filters.marketplace_id;
      }

      if (filters.connection_id) {
        params.connectionId = filters.connection_id;
      }

      debugLog('RESOURCE_EXEC', 'Request parameters', params);

      // Use common pagination handler with specific subscription type
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
      debugLog('RESOURCE_EXEC', 'Getting subscription by ID', { subscriptionId });

      const response = await this.apiService.get<ISubscriptionDetailed>(
        `/subscriptions/${subscriptionId}`,
      );
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
