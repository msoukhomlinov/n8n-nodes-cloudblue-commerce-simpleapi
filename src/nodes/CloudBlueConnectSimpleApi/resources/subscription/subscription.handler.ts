import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import type { ISubscription, ISubscriptionListResponse } from './subscription.types';
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
import { OperationMiddleware } from '../../operations/core/OperationMiddleware';
import { debugLog } from '../../utils/debug';
import { handleErrorWithRetry } from '../../utils/errorHandler';

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
  ): Promise<unknown> {
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
          return this.getSubscription(id);
        }
        case 'update': {
          const id = executeFunctions.getNodeParameter('subscriptionId', i) as string;
          const data = executeFunctions.getNodeParameter('data', i) as IDataObject;
          debugLog('RESOURCE_EXEC', 'Updating subscription', { id, data });
          return this.updateSubscription(id, data);
        }
        case 'updateSpecialPricing': {
          const id = executeFunctions.getNodeParameter('subscriptionId', i) as string;
          const data = executeFunctions.getNodeParameter('data', i) as IDataObject;
          debugLog('RESOURCE_EXEC', 'Updating subscription special pricing', { id, data });
          return this.updateSubscriptionSpecialPricing(id, data);
        }
        case 'getMany': {
          const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
          const additionalParams = executeFunctions.getNodeParameter(
            'params',
            i,
            {},
          ) as IDataObject;
          const params: IDataObject = {};

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

          debugLog('RESOURCE_EXEC', 'Getting many subscriptions', { params, returnAll });
          return this.listSubscriptions(params);
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

  private async getSubscription(id: string): Promise<ISubscription> {
    debugLog('RESOURCE_EXEC', 'Fetching subscription details', { id });
    const response = await this.apiService.request<ISubscription>({
      method: 'GET',
      url: `/subscriptions/${id}`,
    });
    return response.data;
  }

  private async updateSubscription(id: string, data: IDataObject): Promise<ISubscription> {
    debugLog('RESOURCE_EXEC', 'Updating subscription', { id, data });
    const response = await this.apiService.request<ISubscription>({
      method: 'PUT',
      url: `/subscriptions/${id}`,
      data,
    });
    return response.data;
  }

  private async updateSubscriptionSpecialPricing(
    id: string,
    data: IDataObject,
  ): Promise<ISubscription> {
    debugLog('RESOURCE_EXEC', 'Updating subscription special pricing', { id, data });
    const response = await this.apiService.request<ISubscription>({
      method: 'POST',
      url: `/subscriptions/${id}/specialPricing`,
      data,
    });
    return response.data;
  }

  public async listSubscriptions(params: IDataObject): Promise<ISubscription[]> {
    const response = await this.apiService.request<ISubscriptionListResponse>({
      method: 'GET',
      url: '/subscriptions',
      params,
    });
    return response.data.data;
  }

  private initializeOperations(): void {
    debugLog('RESOURCE_INIT', 'Initializing subscription operations');
    const operations = createDefaultCrudOperations<ISubscription>(this.resourceName, {
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
