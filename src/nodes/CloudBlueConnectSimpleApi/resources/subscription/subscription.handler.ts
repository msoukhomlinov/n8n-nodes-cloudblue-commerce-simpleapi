import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import type {
  ISubscription,
  ISubscriptionListResponse,
  ISubscriptionDetailed,
  ISubscriptionDetailedResponse,
} from './subscription.types';
import type { CloudBlueApiService } from '../../services/CloudBlueApiService';
import { createDefaultCrudOperations, registerCrudOperations } from '../../operations/common/crud';
import {
  validateSubscriptionUpdate,
  validateSubscriptionRead,
  validateSubscriptionList,
} from './subscription.validator';
import { OperationRegistry } from '../../operations/core/OperationRegistry';
import type {
  OperationType,
  IOperationContext,
  MiddlewareFunction,
  IOperationResult,
  OperationFunction,
} from '../../operations/core/OperationRegistry';
import { debugLog } from '../../utils/debug';
import { handleErrorWithRetry } from '../../utils/errorHandler';
import { formatResponseArray } from '../../utils/responseFormatter';

type ValidatorFunction = (params: unknown) => Promise<boolean>;
type SubscriptionOperationType = 'get' | 'update' | 'getMany';

export class SubscriptionHandler {
  private static instance: SubscriptionHandler;
  private readonly apiService: CloudBlueApiService;
  private readonly resourceName = 'subscription';

  private constructor(apiService: CloudBlueApiService) {
    debugLog('RESOURCE_INIT', 'Initializing SubscriptionHandler');
    this.apiService = apiService;
    this.initializeOperations();
  }

  public static getInstance(apiService: CloudBlueApiService): SubscriptionHandler {
    if (!SubscriptionHandler.instance) {
      debugLog('RESOURCE_INIT', 'Creating new SubscriptionHandler instance');
      SubscriptionHandler.instance = new SubscriptionHandler(apiService);
    }
    return SubscriptionHandler.instance;
  }

  public async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IDataObject | IDataObject[]> {
    debugLog('RESOURCE_EXEC', 'Executing subscription operation', { operation, index: i });

    const registry = OperationRegistry.getInstance();
    const op = registry.getOperation(this.resourceName, operation as OperationType);
    if (!op) {
      const error = `Operation ${operation} not found for resource ${this.resourceName}`;
      debugLog('RESOURCE_EXEC', 'Operation not found', { error });
      throw new Error(error);
    }

    try {
      switch (operation) {
        case 'get': {
          const id = executeFunctions.getNodeParameter('subscriptionId', i) as string;
          debugLog('RESOURCE_EXEC', 'Getting subscription', { id });
          const subscription = await this.getSubscription(id);
          const formattedItem = executeFunctions.helpers.returnJsonArray([subscription])[0];
          return { ...formattedItem, pairedItem: { item: i } };
        }
        case 'update': {
          const id = executeFunctions.getNodeParameter('subscriptionId', i) as string;
          const data = executeFunctions.getNodeParameter('data', i) as IDataObject;
          debugLog('RESOURCE_EXEC', 'Updating subscription', { id, data });
          const updatedSubscription = await this.updateSubscription(id, data);
          const formattedItem = executeFunctions.helpers.returnJsonArray([updatedSubscription])[0];
          return { ...formattedItem, pairedItem: { item: i } };
        }
        case 'updateSpecialPricing': {
          const id = executeFunctions.getNodeParameter('subscriptionId', i) as string;
          const data = executeFunctions.getNodeParameter('data', i) as IDataObject;
          debugLog('RESOURCE_EXEC', 'Updating subscription special pricing', { id, data });
          const updatedSubscription = await this.updateSubscriptionSpecialPricing(id, data);
          const formattedItem = executeFunctions.helpers.returnJsonArray([updatedSubscription])[0];
          return { ...formattedItem, pairedItem: { item: i } };
        }
        case 'getMany': {
          const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
          const additionalParams = executeFunctions.getNodeParameter(
            'params',
            i,
            {},
          ) as IDataObject;
          const params: IDataObject = {};

          debugLog('RESOURCE_EXEC', 'GetMany operation - Parameters', {
            returnAll,
            additionalParams,
          });

          // Copy additional parameters if they are set
          if (additionalParams.status) {
            params.status = additionalParams.status;
          }
          if (additionalParams.created_after) {
            params.created_after = additionalParams.created_after;
          }
          if (additionalParams.created_before) {
            params.created_before = additionalParams.created_before;
          }

          if (!returnAll) {
            const limit = executeFunctions.getNodeParameter('limit', i) as number;
            params.limit = limit;
          }

          // Get subscriptions using listSubscriptions - now returns array of { json: subscription }
          const items = await this.listSubscriptions(params);

          debugLog('RESOURCE_EXEC', 'Returning items', {
            count: items.length,
            format: 'Array<{ json: ISubscription }>',
          });

          // Return items directly since they're already in n8n format
          return items;
        }
        default: {
          const error = `Operation ${operation} not supported`;
          debugLog('RESOURCE_EXEC', 'Unsupported operation', { error });
          throw new Error(error);
        }
      }
    } catch (error) {
      debugLog('RESOURCE_EXEC', 'Operation failed', {
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return handleErrorWithRetry(error, executeFunctions.getNode(), i);
    }
  }

  private async getSubscription(id: string): Promise<ISubscriptionDetailed> {
    debugLog('RESOURCE_EXEC', 'Fetching subscription details', { id });
    const response = await this.apiService.request<ISubscriptionDetailedResponse>({
      method: 'GET',
      url: `/subscriptions/${id}`,
    });
    return response.data.data;
  }

  private async updateSubscription(id: string, data: IDataObject): Promise<ISubscriptionDetailed> {
    debugLog('RESOURCE_EXEC', 'Updating subscription', { id, data });
    const response = await this.apiService.request<ISubscriptionDetailedResponse>({
      method: 'PUT',
      url: `/subscriptions/${id}`,
      data,
    });
    return response.data.data;
  }

  private async updateSubscriptionSpecialPricing(
    id: string,
    data: IDataObject,
  ): Promise<ISubscriptionDetailed> {
    debugLog('RESOURCE_EXEC', 'Updating subscription special pricing', { id, data });
    const response = await this.apiService.request<ISubscriptionDetailedResponse>({
      method: 'POST',
      url: `/subscriptions/${id}/specialPricing`,
      data,
    });
    return response.data.data;
  }

  public async listSubscriptions(params: IDataObject): Promise<IDataObject[]> {
    debugLog('RESOURCE_EXEC', 'Listing subscriptions - Start', { params });
    const response = await this.apiService.request<ISubscriptionListResponse>({
      method: 'GET',
      url: '/subscriptions',
      params,
    });

    debugLog('RESOURCE_EXEC', 'API Response received', {
      responseData: response.data,
      dataType: typeof response.data,
      hasData: !!response.data?.data,
      dataLength: response.data?.data?.length,
    });

    if (!response.data?.data) {
      debugLog('RESOURCE_EXEC', 'No data found in response');
      return [];
    }

    // Transform each subscription into n8n format
    const items = response.data.data.map((subscription) => ({
      json: subscription,
    }));

    debugLog('RESOURCE_EXEC', 'Transformed subscriptions', {
      count: items.length,
      sampleItem: items[0],
      format: 'Array<{ json: ISubscription }>',
    });

    return items;
  }

  private initializeOperations(): void {
    debugLog('RESOURCE_INIT', 'Initializing subscription operations');
    const operations = createDefaultCrudOperations<IDataObject>(this.resourceName, {
      get: this.getSubscription.bind(this),
      update: this.updateSubscription.bind(this),
      getMany: this.listSubscriptions.bind(this),
    });

    registerCrudOperations(this.resourceName, operations, {
      timeout: 30000,
    });

    debugLog('RESOURCE_INIT', 'Setting up validation middleware');
    const registry = OperationRegistry.getInstance();

    // Add validation middleware for each operation
    const validationMiddleware: Record<SubscriptionOperationType, ValidatorFunction> = {
      get: validateSubscriptionRead,
      update: validateSubscriptionUpdate,
      getMany: validateSubscriptionList,
    };

    const createValidationMiddleware = (
      validator: ValidatorFunction,
      operationName: string,
    ): MiddlewareFunction => {
      return async (
        context: IOperationContext,
        next: OperationFunction,
      ): Promise<IOperationResult<unknown>> => {
        if (await validator(context.params)) {
          return next(context);
        }
        return {
          success: false,
          error: new Error(`Validation failed for ${operationName} operation`),
        };
      };
    };

    for (const [operation, validator] of Object.entries(validationMiddleware)) {
      const middleware = createValidationMiddleware(validator, operation);
      registry.addMiddleware(middleware, this.resourceName, operation as OperationType);
    }

    debugLog('RESOURCE_INIT', 'Subscription operations initialized');
  }

  public async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    debugLog('RESOURCE_EXEC', 'Loading options', { propertyName, currentParameters });
    // TODO: Implement proper options loading
    return [];
  }
}
