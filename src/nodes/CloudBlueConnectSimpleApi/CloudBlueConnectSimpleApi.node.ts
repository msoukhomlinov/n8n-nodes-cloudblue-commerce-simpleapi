import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { CloudBlueApiService } from './services/CloudBlueApiService';

console.log('=== CloudBlueConnectSimpleApi Node Loading ===');

// TODO: Migrate these resources to new structure
// import { ProductResource } from './resources/ProductResource';
import { SubscriptionHandler } from './resources/subscription/subscription.handler';
// import { OrderResource } from './resources/OrderResource';
// import { MarketplaceResource } from './resources/MarketplaceResource';

// TODO: Update this type as resources are migrated
type ResourceType = 'subscription';

export class CloudBlueConnectSimpleApi implements INodeType {
  constructor() {
    console.log('=== CloudBlueConnectSimpleApi Constructor Called ===');
  }

  description: INodeTypeDescription = {
    displayName: 'CloudBlue Connect Simple API',
    name: 'cloudBlueConnectSimpleApi',
    icon: 'file:cloudblue.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Interact with CloudBlue Connect Simple API',
    defaults: {
      name: 'CloudBlue Connect Simple API',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'cloudBlueConnectSimpleApi',
        required: true,
      },
    ],
    properties: [
      // Resource Selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Subscription',
            value: 'subscription',
          },
        ],
        default: 'subscription',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['subscription'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a subscription by ID',
            action: 'Get a subscription',
          },
          {
            name: 'Get Many',
            value: 'getMany',
            description: 'Get many subscriptions',
            action: 'Get many subscriptions',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a subscription',
            action: 'Update a subscription',
          },
          {
            name: 'Update Special Pricing',
            value: 'updateSpecialPricing',
            description: 'Update special pricing for a subscription',
            action: 'Update subscription special pricing',
          },
        ],
        default: 'getMany',
      },
      // Subscription operation parameters
      {
        displayName: 'Subscription ID',
        name: 'subscriptionId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the subscription',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['get', 'update', 'updateSpecialPricing'],
          },
        },
      },
      {
        displayName: 'Data',
        name: 'data',
        type: 'collection',
        required: true,
        default: {},
        placeholder: 'Add Field',
        description: 'The data to update the subscription with',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['update'],
          },
        },
        options: [
          {
            displayName: 'Status',
            name: 'status',
            type: 'string',
            default: '',
            description: 'The status of the subscription',
          },
        ],
      },
      {
        displayName: 'Data',
        name: 'data',
        type: 'collection',
        required: true,
        default: {},
        placeholder: 'Add Field',
        description: 'The special pricing data',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['updateSpecialPricing'],
          },
        },
        options: [
          {
            displayName: 'Price',
            name: 'price',
            type: 'number',
            default: 0,
            description: 'The special price for the subscription',
          },
        ],
      },
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        description: 'Whether to return all results or only up to a given limit',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['getMany'],
          },
        },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
        },
        default: 50,
        description: 'Max number of results to return',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['getMany'],
            returnAll: [false],
          },
        },
      },
      {
        displayName: 'Filters',
        name: 'params',
        type: 'collection',
        default: {},
        placeholder: 'Add Filter',
        description: 'Filter the results',
        displayOptions: {
          show: {
            resource: ['subscription'],
            operation: ['getMany'],
          },
        },
        options: [
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              { name: 'Active', value: 'active' },
              { name: 'Pending', value: 'pending' },
              { name: 'Cancelled', value: 'cancelled' },
              { name: 'Suspended', value: 'suspended' },
            ],
            default: 'active',
            description: 'Filter subscriptions by status',
          },
          {
            displayName: 'Created After',
            name: 'created_after',
            type: 'dateTime',
            default: '',
            description: 'Filter subscriptions created after this date',
          },
          {
            displayName: 'Created Before',
            name: 'created_before',
            type: 'dateTime',
            default: '',
            description: 'Filter subscriptions created before this date',
          },
          {
            displayName: 'Product ID',
            name: 'product_id',
            type: 'string',
            default: '',
            description: 'Filter by product ID',
          },
          {
            displayName: 'Marketplace ID',
            name: 'marketplace_id',
            type: 'string',
            default: '',
            description: 'Filter by marketplace ID',
          },
          {
            displayName: 'Connection ID',
            name: 'connection_id',
            type: 'string',
            default: '',
            description: 'Filter by connection ID',
          },
          {
            displayName: 'External ID',
            name: 'external_id',
            type: 'string',
            default: '',
            description: 'Filter by external ID',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    console.log('=== CloudBlueConnectSimpleApi Execute Called ===');
    console.log('Getting input data...');
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    console.log('Getting parameters...');
    const resource = this.getNodeParameter('resource', 0) as ResourceType;
    const operation = this.getNodeParameter('operation', 0) as string;

    console.log('Parameters:', { resource, operation });

    const credentials = await this.getCredentials('cloudBlueConnectSimpleApi');
    const apiService = CloudBlueApiService.getInstance(
      credentials.apiUrl as string,
      credentials.authUrl as string,
      credentials.username as string,
      credentials.password as string,
      credentials.clientId as string,
      credentials.clientSecret as string,
      credentials.subscriptionKey as string,
    );

    // Initialize resources map for this execution
    const resources = {
      subscription: SubscriptionHandler.getInstance(apiService),
    };

    const resourceInstance = resources[resource];
    if (!resourceInstance) {
      throw new NodeOperationError(
        this.getNode(),
        `Resource ${resource} not found or not yet migrated`,
      );
    }

    for (let i = 0; i < items.length; i++) {
      try {
        console.log(`Processing item ${i + 1}/${items.length}`);
        const response = await resourceInstance.execute(this, operation, i);
        returnData.push({
          json: response as unknown as IDataObject,
        });
      } catch (error) {
        console.log('Error in execute:', error);
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
          });
          continue;
        }
        throw new NodeOperationError(
          this.getNode(),
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            itemIndex: i,
            description: JSON.stringify({
              resource,
              operation,
              error: error instanceof Error ? error.stack : undefined,
            }),
          },
        );
      }
    }

    console.log('Execute completed, returning data');
    return [returnData];
  }

  async loadOptions(this: ILoadOptionsFunctions) {
    const resource = this.getNodeParameter('resource') as ResourceType;
    const propertyName = this.getNodeParameter('loadOptionsMethod') as string;
    const currentNodeParameters = this.getCurrentNodeParameters() as Record<string, unknown>;

    const credentials = await this.getCredentials('cloudBlueConnectSimpleApi');
    const apiService = CloudBlueApiService.getInstance(
      credentials.apiUrl as string,
      credentials.authUrl as string,
      credentials.username as string,
      credentials.password as string,
      credentials.clientId as string,
      credentials.clientSecret as string,
      credentials.subscriptionKey as string,
    );

    const resources = {
      subscription: SubscriptionHandler.getInstance(apiService),
    };

    const resourceInstance = resources[resource];
    if (!resourceInstance) {
      return [];
    }

    return resourceInstance.loadOptions(this, propertyName, currentNodeParameters);
  }
}
