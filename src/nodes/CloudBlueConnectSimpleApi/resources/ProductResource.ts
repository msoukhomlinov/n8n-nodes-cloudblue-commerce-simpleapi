import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IPaginatedResponse } from '../interfaces';
import type { IProduct } from '../interfaces/IProduct';

export class ProductResource extends BaseResource {
  protected basePath = '/products';
  protected resource: IResource = {
    name: 'Product',
    value: 'product',
    description: 'Manage products in CloudBlue',
    operations: {
      list: {
        name: 'List',
        value: 'list',
        description: 'List all products',
        action: 'List all products',
        properties: [
          {
            displayName: 'Return All',
            name: 'returnAll',
            type: 'boolean',
            default: false,
            description: 'Whether to return all results or only up to a given limit',
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            typeOptions: {
              minValue: 1,
            },
            default: 10,
            description: 'Max number of results to return',
            displayOptions: {
              show: {
                returnAll: [false],
              },
            },
          },
          {
            displayName: 'Additional Fields',
            name: 'additionalFields',
            type: 'collection',
            placeholder: 'Add Field',
            default: {},
            options: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Filter products by name',
              },
              {
                displayName: 'Service Name',
                name: 'serviceName',
                type: 'string',
                default: '',
                description: 'Filter products by service name',
              },
              {
                displayName: 'MPN',
                name: 'mpn',
                type: 'string',
                default: '',
                description: 'Filter products by Manufacturer Part Number',
              },
              {
                displayName: 'Vendor',
                name: 'vendor',
                type: 'string',
                default: '',
                description: 'Filter products by vendor/manufacturer ID',
              },
              {
                displayName: 'Billing Model',
                name: 'billingModel',
                type: 'options',
                options: [
                  { name: 'Charge Before Billing Period', value: 'chargeBeforeBillingPeriod' },
                  { name: 'Charge After Billing Period', value: 'chargeAfterBillingPeriod' },
                  {
                    name: 'Charge Before Subscription Period',
                    value: 'chargeBeforeSubscriptionPeriod',
                  },
                  { name: 'Charge External Rating', value: 'chargeExternalRating' },
                  { name: 'Unknown', value: 'unknown' },
                ],
                default: '',
                description: 'Filter products by billing model',
              },
              {
                displayName: 'Period Type',
                name: 'periodType',
                type: 'options',
                options: [
                  { name: 'Day', value: 'day' },
                  { name: 'Month', value: 'month' },
                  { name: 'Year', value: 'year' },
                  { name: 'Statement Day', value: 'statement_day' },
                  { name: 'Unknown', value: 'unknown' },
                ],
                default: '',
                description: 'Filter products by period type',
              },
              {
                displayName: 'Price Type',
                name: 'priceType',
                type: 'options',
                options: [
                  { name: 'Recurring', value: 'recurring' },
                  { name: 'Setup', value: 'setup' },
                  { name: 'Overuse', value: 'overuse' },
                ],
                default: '',
                description: 'Filter products by price type',
              },
              {
                displayName: 'Price Model',
                name: 'priceModel',
                type: 'options',
                options: [
                  { name: 'Flat', value: 'FLAT' },
                  { name: 'Tiered', value: 'TIERED' },
                  { name: 'Volume Subscription', value: 'VOLUME_SUBSCRIPTION' },
                  { name: 'Volume Order', value: 'VOLUME_ORDER' },
                  { name: 'Volume Resource Aggregated', value: 'VOLUME_RESOURCE_AGGREGATED' },
                ],
                default: '',
                description: 'Filter products by price model',
              },
              {
                displayName: 'Coterming Required',
                name: 'cotermingRequired',
                type: 'options',
                options: [
                  { name: 'Mandatory', value: 'MANDATORY' },
                  { name: 'Allowed', value: 'ALLOWED' },
                  { name: 'Restricted', value: 'RESTRICTED' },
                ],
                default: '',
                description: 'Filter products by coterming requirement',
              },
              {
                displayName: 'Coterming Type',
                name: 'cotermingType',
                type: 'options',
                options: [
                  { name: 'Subscription', value: 'SUBSCRIPTION' },
                  { name: 'End of Month', value: 'END_OF_MONTH' },
                ],
                default: '',
                description: 'Filter products by coterming type',
              },
              {
                displayName: 'Offset',
                name: 'offset',
                type: 'number',
                typeOptions: {
                  minValue: 0,
                },
                default: 0,
                description: 'Number of items to skip before starting to collect the result set',
              },
              {
                displayName: 'Subscription Period',
                name: 'subscriptionPeriod',
                type: 'collection',
                placeholder: 'Add Subscription Period',
                default: {},
                options: [
                  {
                    displayName: 'Type',
                    name: 'type',
                    type: 'options',
                    options: [
                      { name: 'Day', value: 'day' },
                      { name: 'Month', value: 'month' },
                      { name: 'Year', value: 'year' },
                    ],
                    default: '',
                    description: 'The type of subscription period',
                  },
                  {
                    displayName: 'Duration',
                    name: 'duration',
                    type: 'number',
                    default: 1,
                    description: 'The duration of the subscription period',
                  },
                ],
              },
              {
                displayName: 'Billing Period',
                name: 'billingPeriod',
                type: 'collection',
                placeholder: 'Add Billing Period',
                default: {},
                options: [
                  {
                    displayName: 'Type',
                    name: 'type',
                    type: 'options',
                    options: [
                      { name: 'Day', value: 'day' },
                      { name: 'Month', value: 'month' },
                      { name: 'Year', value: 'year' },
                    ],
                    default: '',
                    description: 'The type of billing period',
                  },
                  {
                    displayName: 'Duration',
                    name: 'duration',
                    type: 'number',
                    default: 1,
                    description: 'The duration of the billing period',
                  },
                ],
              },
            ],
          },
        ],
      },
      get: {
        name: 'Get',
        value: 'get',
        description: 'Get a product by ID',
        action: 'Get a product',
        properties: [
          {
            displayName: 'Product ID',
            name: 'id',
            type: 'string',
            required: true,
            default: '',
            description: 'The ID of the product to retrieve',
          },
        ],
      },
    },
    properties: [],
  };

  async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IPaginatedResponse<unknown>> {
    switch (operation) {
      case 'list': {
        const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
        const filters = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'filters',
            type: 'string',
          },
        ]);

        if (returnAll) {
          const products = await this.paginationService.getPaginatedResults<IProduct>(
            this.apiService,
            executeFunctions,
            this.basePath,
            {
              returnAll: true,
              additionalParams: filters,
            },
          );

          return {
            data: products,
            pagination: {
              offset: 0,
              limit: products.length,
              total: products.length,
            },
          };
        }

        const limit = executeFunctions.getNodeParameter('limit', i) as number;
        return this.makeRequest<IProduct>(executeFunctions, 'GET', '', undefined, {
          ...filters,
          limit,
        });
      }

      case 'get': {
        const id = executeFunctions.getNodeParameter('id', i) as string;
        return this.makeRequest<IProduct>(executeFunctions, 'GET', `/${id}`);
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
    if (propertyName === 'productId') {
      const response = await this.makeRequest<IProduct>(
        loadOptionsFunctions,
        'GET',
        '',
        undefined,
        { limit: 100 },
      );

      return response.data.map((product: IProduct) => ({
        name: product.name,
        value: product.id,
      }));
    }

    return [];
  }
}
