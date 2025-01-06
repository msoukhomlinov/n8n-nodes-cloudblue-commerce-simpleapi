import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { ProductResource } from './resources/ProductResource';
import { SubscriptionResource } from './resources/SubscriptionResource';
import { OrderResource } from './resources/OrderResource';
import { MarketplaceResource } from './resources/MarketplaceResource';

type ResourceType = 'product' | 'subscription' | 'order' | 'marketplace';

export class CloudBlueConnectSimpleApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CloudBlue Connect Simple API',
		name: 'cloudBlueConnectSimpleApi',
		icon: 'file:cloudblue.png',
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
			{
					displayName: 'Resource',
					name: 'resource',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'Product',
							value: 'product',
						},
						{
							name: 'Subscription',
							value: 'subscription',
						},
						{
							name: 'Order',
							value: 'order',
						},
						{
							name: 'Marketplace',
							value: 'marketplace',
						},
					],
					default: 'product',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['product'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all products',
						action: 'List all products',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a product by ID',
						action: 'Get a product',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new product',
						action: 'Create a product',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a product',
						action: 'Update a product',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
				displayOptions: {
					show: {
						resource: ['product', 'subscription', 'order', 'marketplace'],
						operation: ['list'],
					},
				},
			},
			{
				displayName: 'Max Records',
				name: 'maxRecords',
				type: 'number',
				default: 10,
				description: 'Max number of records to return',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['product', 'subscription', 'order', 'marketplace'],
						operation: ['list'],
						returnAll: [false],
					},
				},
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
						name: 'List',
						value: 'list',
						description: 'List all subscriptions',
						action: 'List all subscriptions',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a subscription by ID',
						action: 'Get a subscription',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new subscription',
						action: 'Create a subscription',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a subscription',
						action: 'Update a subscription',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['order'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all orders',
						action: 'List all orders',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an order by ID',
						action: 'Get an order',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new order',
						action: 'Create an order',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an order',
						action: 'Update an order',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['marketplace'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all marketplaces',
						action: 'List all marketplaces',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a marketplace by ID',
						action: 'Get a marketplace',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new marketplace',
						action: 'Create a marketplace',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a marketplace',
						action: 'Update a marketplace',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Product ID',
				name: 'productId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
				required: true,
				default: '',
				description: 'The ID of the product',
				displayOptions: {
					show: {
						resource: ['subscription'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Marketplace ID',
				name: 'marketplaceId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getMarketplaces',
				},
				required: true,
				default: '',
				description: 'The ID of the marketplace',
				displayOptions: {
					show: {
						resource: ['subscription'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Product ID',
				name: 'productId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the product to retrieve',
				displayOptions: {
					show: {
						resource: ['product'],
						operation: ['get', 'update'],
					},
				},
			},
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
						operation: ['get', 'update'],
					},
				},
			},
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the order',
				displayOptions: {
					show: {
						resource: ['order'],
						operation: ['get', 'update'],
					},
				},
			},
			{
				displayName: 'Marketplace ID',
				name: 'marketplaceId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the marketplace',
				displayOptions: {
					show: {
						resource: ['marketplace'],
						operation: ['get', 'update'],
					},
				},
			},
		],
	};

	private readonly resources = {
		product: new ProductResource(),
		subscription: new SubscriptionResource(),
		order: new OrderResource(),
		marketplace: new MarketplaceResource(),
	} as const;

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as ResourceType;
		const operation = this.getNodeParameter('operation', 0) as string;

		const self = this as unknown as CloudBlueConnectSimpleApi;
		const resourceInstance = self.resources[resource];

		for (let i = 0; i < items.length; i++) {
			try {
				const response = await resourceInstance.execute(this, operation, i);
				if (response.success && response.data) {
					returnData.push({
						json: response.data as unknown as IDataObject,
					});
				} else if (response.error) {
					throw new Error(
						`CloudBlue API Error: ${response.error.message} (Code: ${response.error.code})`,
					);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error occurred',
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	async loadOptions(this: ILoadOptionsFunctions) {
		const resource = this.getNodeParameter('resource') as ResourceType;
		const propertyName = this.getNodeParameter('loadOptionsMethod') as string;
		const currentNodeParameters = this.getCurrentNodeParameters() as Record<string, unknown>;

		const self = this as unknown as CloudBlueConnectSimpleApi;
		const resourceInstance = self.resources[resource];

		switch (propertyName) {
			case 'productId': {
				return resourceInstance.loadOptions(
					this,
					'productId',
					currentNodeParameters,
				);
			}

			case 'marketplaceId': {
				return resourceInstance.loadOptions(
					this,
					'marketplaceId',
					currentNodeParameters,
				);
			}

			case 'subscriptionId': {
				return resourceInstance.loadOptions(
					this,
					'subscriptionId',
					currentNodeParameters,
				);
			}

			default:
				return [];
		}
	}
} 