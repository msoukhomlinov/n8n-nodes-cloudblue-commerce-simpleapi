import type {
  IDataObject,
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import type { ISubscriptionListResponse } from './subscription.types';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { debugLog } from '../../utils/debug';

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

      // Handle limit parameter
      const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
      if (!returnAll) {
        const limit = executeFunctions.getNodeParameter('limit', i) as number;
        params.limit = limit;
      }

      // Get raw response from API
      const response = await this.apiService.request<ISubscriptionListResponse>({
        method: 'GET',
        url: '/subscriptions',
        params,
      });

      if (!response.data?.data) {
        return [];
      }

      debugLog('RESOURCE_EXEC', 'Raw API response', {
        data: response.data,
        hasData: !!response.data?.data,
        count: response.data.data.length,
        limit: params.limit,
        returnAll,
      });

      debugLog('RESOURCE_EXEC', 'Mapped output', response.data.data);

      // Return raw data array
      return response.data.data.map((record: IDataObject) => ({
        json: record,
      }));
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
