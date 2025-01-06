import type {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    IDataObject,
    INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IApiResponse } from '../interfaces';
import type { IOrder, IOrderListResponse } from '../interfaces/IOrder';

export class OrderResource extends BaseResource {
    protected basePath = '/orders';
    protected resource: IResource = {
        name: 'Order',
        value: 'order',
        description: 'Manage orders in CloudBlue',
        operations: {
            list: {
                name: 'List',
                value: 'list',
                description: 'List all orders',
                action: 'List all orders',
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
                                displayName: 'Customer ID',
                                name: 'customerId',
                                type: 'string',
                                default: '',
                                description: 'Filter orders by customer ID',
                            },
                            {
                                displayName: 'Status',
                                name: 'status',
                                type: 'options',
                                options: [
                                    { name: 'Draft', value: 'draft' },
                                    { name: 'Processing', value: 'processing' },
                                    { name: 'Error', value: 'error' },
                                    { name: 'Complete', value: 'complete' },
                                    { name: 'Cancelled', value: 'cancelled' },
                                ],
                                default: '',
                                description: 'Filter orders by status',
                            },
                            {
                                displayName: 'Subscription ID',
                                name: 'subscriptionId',
                                type: 'string',
                                default: '',
                                description: 'Filter orders by subscription ID',
                            },
                            {
                                displayName: 'Creation Time From',
                                name: 'creationTimeFrom',
                                type: 'dateTime',
                                default: '',
                                description: 'Filter orders created after this date and time (ISO-8601 UTC format)',
                            },
                            {
                                displayName: 'Creation Time To',
                                name: 'creationTimeTo',
                                type: 'dateTime',
                                default: '',
                                description: 'Filter orders created before this date and time (ISO-8601 UTC format)',
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
                        ],
                    },
                ],
            },
            get: {
                name: 'Get',
                value: 'get',
                description: 'Get an order by ID',
                action: 'Get an order',
                properties: [
                    {
                        displayName: 'Order ID',
                        name: 'id',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the order to retrieve',
                    },
                ],
            },
            create: {
                name: 'Create',
                value: 'create',
                description: 'Create a new order',
                action: 'Create a new order',
                properties: [
                    {
                        displayName: 'Type',
                        name: 'type',
                        type: 'options',
                        options: [
                            { name: 'Sales', value: 'sales' },
                            { name: 'Change', value: 'change' },
                            { name: 'Renewal', value: 'renewal' },
                            { name: 'Cancellation', value: 'cancellation' },
                            { name: 'Migration', value: 'migration' },
                        ],
                        required: true,
                        default: 'sales',
                        description: 'The type of order to create',
                    },
                    {
                        displayName: 'Customer ID',
                        name: 'customerId',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the customer for the order',
                    },
                    {
                        displayName: 'Products',
                        name: 'products',
                        type: 'fixedCollection',
                        typeOptions: {
                            multipleValues: true,
                        },
                        displayOptions: {
                            show: {
                                type: ['sales', 'change'],
                            },
                        },
                        description: 'Products to order',
                        default: {},
                        options: [
                            {
                                name: 'product',
                                displayName: 'Product',
                                values: [
                                    {
                                        displayName: 'MPN',
                                        name: 'mpn',
                                        type: 'string',
                                        required: true,
                                        default: '',
                                        description: 'Manufacturer Part Number',
                                    },
                                    {
                                        displayName: 'Quantity',
                                        name: 'quantity',
                                        type: 'number',
                                        required: true,
                                        default: 1,
                                        description: 'Product quantity',
                                    },
                                    {
                                        displayName: 'Vendor',
                                        name: 'vendor',
                                        type: 'string',
                                        default: '',
                                        description: 'Vendor/manufacturer ID',
                                    },
                                    {
                                        displayName: 'Parameters',
                                        name: 'parameters',
                                        type: 'fixedCollection',
                                        typeOptions: {
                                            multipleValues: true,
                                        },
                                        default: {},
                                        options: [
                                            {
                                                name: 'parameter',
                                                displayName: 'Parameter',
                                                values: [
                                                    {
                                                        displayName: 'Name',
                                                        name: 'name',
                                                        type: 'string',
                                                        required: true,
                                                        default: '',
                                                        description: 'Parameter name',
                                                    },
                                                    {
                                                        displayName: 'Value',
                                                        name: 'value',
                                                        type: 'string',
                                                        default: '',
                                                        description: 'Parameter value',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        displayName: 'Subscription ID',
                        name: 'subscriptionId',
                        type: 'string',
                        required: true,
                        displayOptions: {
                            show: {
                                type: ['change', 'renewal', 'cancellation'],
                            },
                        },
                        default: '',
                        description: 'The ID of the subscription to modify',
                    },
                    {
                        displayName: 'Additional Fields',
                        name: 'additionalFields',
                        type: 'collection',
                        placeholder: 'Add Field',
                        default: {},
                        options: [
                            {
                                displayName: 'PO Number',
                                name: 'poNumber',
                                type: 'string',
                                default: '',
                                description: 'Purchase order number',
                            },
                            {
                                displayName: 'Credit Check',
                                name: 'creditCheck',
                                type: 'boolean',
                                default: true,
                                description: 'Whether to check customer credit',
                            },
                            {
                                displayName: 'Migration Program',
                                name: 'migrationProgram',
                                type: 'options',
                                displayOptions: {
                                    show: {
                                        '/type': ['migration'],
                                    },
                                },
                                options: [
                                    { name: 'Count Migration Billing Period', value: 'count_migration_billing_period' },
                                    { name: 'Do Not Count Migration Billing Period', value: 'do_not_count_migration_billing_period' },
                                    { name: 'Prorate Migration Billing Period', value: 'prorate_migration_billing_period' },
                                ],
                                default: '',
                                description: 'Migration program type',
                            },
                            {
                                displayName: 'Start Date',
                                name: 'startDate',
                                type: 'dateTime',
                                displayOptions: {
                                    show: {
                                        '/type': ['migration'],
                                    },
                                },
                                default: '',
                                description: 'Start date for migration orders (ISO-8601)',
                            },
                            {
                                displayName: 'Migration Date',
                                name: 'migrationDate',
                                type: 'dateTime',
                                displayOptions: {
                                    show: {
                                        '/type': ['migration'],
                                    },
                                },
                                default: '',
                                description: 'Migration date (ISO-8601)',
                            },
                            {
                                displayName: 'Subscription Period',
                                name: 'subscriptionPeriod',
                                type: 'collection',
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
                        ],
                    },
                ],
            },
            estimate: {
                name: 'Estimate',
                value: 'estimate',
                description: 'Estimate order prices',
                action: 'Estimate order prices',
                properties: [
                    {
                        displayName: 'Type',
                        name: 'type',
                        type: 'options',
                        options: [
                            { name: 'Sales', value: 'sales' },
                            { name: 'Change', value: 'change' },
                            { name: 'Renewal', value: 'renewal' },
                            { name: 'Cancellation', value: 'cancellation' },
                        ],
                        required: true,
                        default: 'sales',
                        description: 'The type of order to estimate',
                    },
                    {
                        displayName: 'Customer ID',
                        name: 'customerId',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the customer for the order',
                    },
                    {
                        displayName: 'Products',
                        name: 'products',
                        type: 'fixedCollection',
                        typeOptions: {
                            multipleValues: true,
                        },
                        displayOptions: {
                            show: {
                                type: ['sales', 'change'],
                            },
                        },
                        description: 'Products to estimate',
                        default: {},
                        options: [
                            {
                                name: 'product',
                                displayName: 'Product',
                                values: [
                                    {
                                        displayName: 'MPN',
                                        name: 'mpn',
                                        type: 'string',
                                        required: true,
                                        default: '',
                                        description: 'Manufacturer Part Number',
                                    },
                                    {
                                        displayName: 'Quantity',
                                        name: 'quantity',
                                        type: 'number',
                                        required: true,
                                        default: 1,
                                        description: 'Product quantity',
                                    },
                                    {
                                        displayName: 'Vendor',
                                        name: 'vendor',
                                        type: 'string',
                                        default: '',
                                        description: 'Vendor/manufacturer ID',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        displayName: 'Subscription ID',
                        name: 'subscriptionId',
                        type: 'string',
                        required: true,
                        displayOptions: {
                            show: {
                                type: ['change', 'renewal', 'cancellation'],
                            },
                        },
                        default: '',
                        description: 'The ID of the subscription to estimate',
                    },
                ],
            },
            update: {
                name: 'Update',
                value: 'update',
                description: 'Update an order',
                action: 'Update an order',
                properties: [
                    {
                        displayName: 'Order ID',
                        name: 'id',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the order to update',
                    },
                    {
                        displayName: 'Credit Check',
                        name: 'creditCheck',
                        type: 'boolean',
                        required: true,
                        default: true,
                        description: 'Whether to check customer credit',
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
    ): Promise<IApiResponse<unknown>> {
        let response: IApiResponse<unknown>;

        switch (operation) {
            case 'list': {
                const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
                const additionalFields = executeFunctions.getNodeParameter('additionalFields', i, {}) as IDataObject;
                const qs: IDataObject = {};

                // Handle all query parameters
                if (additionalFields.customerId) {
                    qs.customerId = additionalFields.customerId;
                }
                if (additionalFields.status) {
                    qs.status = additionalFields.status;
                }
                if (additionalFields.subscriptionId) {
                    qs.subscriptionId = additionalFields.subscriptionId;
                }
                if (additionalFields.creationTimeFrom) {
                    qs.creationTimeFrom = additionalFields.creationTimeFrom;
                }
                if (additionalFields.creationTimeTo) {
                    qs.creationTimeTo = additionalFields.creationTimeTo;
                }
                if (additionalFields.offset) {
                    qs.offset = additionalFields.offset;
                }

                if (returnAll) {
                    response = await this.makeRequest(
                        executeFunctions,
                        'GET',
                        '',
                        undefined,
                        qs,
                    );
                } else {
                    const limit = executeFunctions.getNodeParameter('limit', i) as number;
                    qs.limit = limit;
                    response = await this.makeRequest(
                        executeFunctions,
                        'GET',
                        '',
                        undefined,
                        qs,
                    );
                }
                break;
            }
            case 'get': {
                const id = executeFunctions.getNodeParameter('id', i) as string;
                response = await this.makeRequest<IOrder>(
                    executeFunctions,
                    'GET',
                    `/${id}`,
                );
                break;
            }
            case 'create': {
                const type = executeFunctions.getNodeParameter('type', i) as string;
                const customerId = executeFunctions.getNodeParameter('customerId', i) as string;
                const additionalFields = executeFunctions.getNodeParameter('additionalFields', i, {}) as IDataObject;

                const body: IDataObject = {
                    type,
                    customerId,
                };

                if (type === 'sales' || type === 'change') {
                    const productsData = executeFunctions.getNodeParameter('products', i) as {
                        product: Array<{
                            mpn: string;
                            quantity: number;
                            vendor?: string;
                            parameters?: {
                                parameter: Array<{
                                    name: string;
                                    value: string;
                                }>;
                            };
                        }>;
                    };

                    body.products = productsData.product.map(product => {
                        const mappedProduct: IDataObject = {
                            mpn: product.mpn,
                            quantity: product.quantity,
                        };

                        if (product.vendor) {
                            mappedProduct.vendor = product.vendor;
                        }

                        if (product.parameters?.parameter) {
                            mappedProduct.parameters = product.parameters.parameter.map(param => ({
                                name: param.name,
                                value: param.value,
                            }));
                        }

                        return mappedProduct;
                    });
                }

                if (type === 'change' || type === 'renewal' || type === 'cancellation') {
                    body.subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;
                }

                if (additionalFields.poNumber) {
                    body.poNumber = additionalFields.poNumber;
                }

                if (additionalFields.creditCheck !== undefined) {
                    body.creditCheck = additionalFields.creditCheck;
                }

                if (type === 'migration') {
                    if (additionalFields.migrationProgram) {
                        body.migrationProgram = additionalFields.migrationProgram;
                    }
                    if (additionalFields.startDate) {
                        body.startDate = additionalFields.startDate;
                    }
                    if (additionalFields.migrationDate) {
                        body.migrationDate = additionalFields.migrationDate;
                    }
                }

                if (additionalFields.subscriptionPeriod) {
                    const subscriptionPeriod = additionalFields.subscriptionPeriod as IDataObject;
                    if (subscriptionPeriod.type && subscriptionPeriod.duration) {
                        body.subscriptionPeriod = {
                            type: subscriptionPeriod.type,
                            duration: subscriptionPeriod.duration,
                        };
                    }
                }

                response = await this.makeRequest<IOrder>(
                    executeFunctions,
                    'POST',
                    '',
                    body,
                );
                break;
            }
            case 'estimate': {
                const type = executeFunctions.getNodeParameter('type', i) as string;
                const customerId = executeFunctions.getNodeParameter('customerId', i) as string;

                const body: IDataObject = {
                    type,
                    customerId,
                };

                if (type === 'sales' || type === 'change') {
                    const productsData = executeFunctions.getNodeParameter('products', i) as {
                        product: Array<{
                            mpn: string;
                            quantity: number;
                            vendor?: string;
                        }>;
                    };

                    body.products = productsData.product.map(product => {
                        const mappedProduct: IDataObject = {
                            mpn: product.mpn,
                            quantity: product.quantity,
                        };

                        if (product.vendor) {
                            mappedProduct.vendor = product.vendor;
                        }

                        return mappedProduct;
                    });
                }

                if (type === 'change' || type === 'renewal' || type === 'cancellation') {
                    body.subscriptionId = executeFunctions.getNodeParameter('subscriptionId', i) as string;
                }

                response = await this.makeRequest<unknown>(
                    executeFunctions,
                    'POST',
                    '/estimate',
                    body,
                );
                break;
            }
            case 'update': {
                const id = executeFunctions.getNodeParameter('id', i) as string;
                const creditCheck = executeFunctions.getNodeParameter('creditCheck', i) as boolean;

                response = await this.makeRequest<IOrder>(
                    executeFunctions,
                    'PATCH',
                    `/${id}`,
                    { creditCheck },
                );
                break;
            }
            default:
                throw new Error(`Operation ${operation} not found`);
        }

        return response;
    }

    async loadOptions(
        loadOptionsFunctions: ILoadOptionsFunctions,
        propertyName: string,
        currentNodeParameters: Record<string, unknown>,
    ): Promise<INodePropertyOptions[]> {
        if (propertyName === 'orderId') {
            const response = await this.makeRequest<IOrderListResponse>(
                loadOptionsFunctions,
                'GET',
                '',
                undefined,
                { limit: 100 },
            );

            if (!response.success || !response.data) {
                throw new Error('Failed to load orders');
            }

            return response.data.orders.map((order) => ({
                name: `${order.orderNumber} (${order.status})`,
                value: order.id,
            }));
        }

        return [];
    }
} 