import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IPaginatedResponse } from '../interfaces';
import type { ISubscription, ISubscriptionListResponse } from '../interfaces/ISubscription';
import { PaginationService } from '../services/PaginationService';
import { QueryParameterService } from '../services/QueryParameterService';
import { ResponseProcessingService } from '../services/ResponseProcessingService';

export class SubscriptionResource extends BaseResource {
  protected basePath = '/subscriptions';
  protected resource: IResource = {
    name: 'Subscription',
    value: 'subscription',
    description: 'Manage subscriptions in CloudBlue',
    properties: [
      {
        displayName: 'Filters',
        name: 'filters',
        type: 'collection',
        placeholder: 'Add Filter',
        default: {},
        options: [
          {
            displayName: 'Customer ID',
            name: 'customerId',
            type: 'string',
            default: '',
            description: 'Filter subscriptions by customer ID',
          },
          {
            displayName: 'Creation Date From',
            name: 'creationDateFrom',
            type: 'dateTime',
            default: '',
            description: 'Find subscriptions that were created after specified date',
          },
          {
            displayName: 'Creation Date To',
            name: 'creationDateTo',
            type: 'dateTime',
            default: '',
            description: 'Find subscriptions that were created before specified date',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Pending', value: 'pending' },
              { name: 'Active', value: 'active' },
              { name: 'Hold', value: 'hold' },
              { name: 'Terminated', value: 'terminated' },
              { name: 'Removed', value: 'removed' },
            ],
            default: '',
            description: 'Filter subscriptions by status',
          },
        ],
      },
    ],
    operations: {},
  };

  async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IPaginatedResponse<unknown>> {
    switch (operation) {
      case 'list': {
        const paginationParams = this.queryParameterService.extractPaginationParameters(
          executeFunctions,
          i,
        );

        // Get filters from collection
        const filters = executeFunctions.getNodeParameter('filters', i, {}) as IDataObject;
        const filterParams: IDataObject = {};

        if (filters.customerId) {
          filterParams.customerId = filters.customerId;
        }

        if (filters.status) {
          filterParams.status = filters.status;
        }

        if (filters.creationDateFrom) {
          filterParams.creationDateFrom = filters.creationDateFrom;
        }

        if (filters.creationDateTo) {
          filterParams.creationDateTo = filters.creationDateTo;
        }

        if (paginationParams.returnAll) {
          const subscriptions = await this.paginationService.getPaginatedResults<ISubscription>(
            this.apiService,
            executeFunctions,
            this.basePath,
            {
              returnAll: true,
              additionalParams: filterParams,
            },
          );

          return {
            data: subscriptions,
            pagination: {
              offset: 0,
              limit: subscriptions.length,
              total: subscriptions.length,
            },
          };
        }

        return this.makeRequest<ISubscription>(executeFunctions, 'GET', '', undefined, {
          ...filterParams,
          limit: paginationParams.limit,
          offset: paginationParams.offset,
        });
      }

      case 'get': {
        const id = executeFunctions.getNodeParameter('id', i) as string;
        const response = await this.makeRequest<ISubscription>(executeFunctions, 'GET', `/${id}`);
        return response;
      }

      default:
        throw new Error(`Operation ${operation} not found`);
    }
  }

  async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentNodeParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    if (propertyName === 'subscriptionId') {
      const response = await this.makeRequest<ISubscription>(
        loadOptionsFunctions,
        'GET',
        '',
        undefined,
        { limit: 100 },
      );

      return response.data.map((subscription) => ({
        name: `${subscription.id} (${subscription.status})`,
        value: subscription.id,
      }));
    }

    return [];
  }
}
