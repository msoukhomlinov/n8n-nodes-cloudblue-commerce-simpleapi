import type { IDataObject, ILoadOptionsFunctions, IExecuteFunctions, INodePropertyOptions } from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IServicePlan, IServicePlanListResponse } from '../interfaces/IServicePlan';
import type { IResource, IApiResponse } from '../interfaces';

export class ServicePlanResource extends BaseResource {
    protected basePath = '/plans';
    protected resource: IResource = {
        name: 'Service Plan',
        value: 'servicePlan',
        description: 'Manage service plans in CloudBlue',
        operations: {
            list: {
                name: 'List',
                value: 'list',
                description: 'List all service plans',
                action: 'List all service plans',
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
                                displayName: 'Status',
                                name: 'status',
                                type: 'options',
                                options: [
                                    { name: 'Active', value: 'active' },
                                    { name: 'Draft', value: 'draft' },
                                    { name: 'Retired', value: 'retired' },
                                ],
                                default: '',
                                description: 'Filter service plans by status',
                            },
                            {
                                displayName: 'Technical',
                                name: 'technical',
                                type: 'boolean',
                                default: false,
                                description: 'Filter service plans by technical flag',
                            },
                            {
                                displayName: 'Search',
                                name: 'search',
                                type: 'string',
                                default: '',
                                description: 'Search service plans by name or description',
                            },
                        ],
                    },
                ],
            },
            get: {
                name: 'Get',
                value: 'get',
                description: 'Get a specific service plan',
                action: 'Get a specific service plan',
                properties: [
                    {
                        displayName: 'Plan ID',
                        name: 'planId',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'ID of the service plan to retrieve',
                    },
                ],
            },
            create: {
                name: 'Create',
                value: 'create',
                description: 'Create a new service plan',
                action: 'Create a service plan',
                properties: [
                    {
                        displayName: 'Name',
                        name: 'name',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The name of the service plan',
                    },
                    {
                        displayName: 'Status',
                        name: 'status',
                        type: 'options',
                        required: true,
                        options: [
                            { name: 'Active', value: 'active' },
                            { name: 'Draft', value: 'draft' },
                            { name: 'Retired', value: 'retired' },
                        ],
                        default: 'draft',
                        description: 'The status of the service plan',
                    },
                    {
                        displayName: 'Prices',
                        name: 'prices',
                        type: 'fixedCollection',
                        typeOptions: {
                            multipleValues: true,
                        },
                        required: true,
                        default: {},
                        description: 'The prices for the service plan',
                        options: [
                            {
                                name: 'price',
                                displayName: 'Price',
                                values: [
                                    {
                                        displayName: 'Amount',
                                        name: 'amount',
                                        type: 'string',
                                        required: true,
                                        default: '',
                                        description: 'The price amount',
                                    },
                                    {
                                        displayName: 'Currency',
                                        name: 'currency',
                                        type: 'string',
                                        required: true,
                                        default: '',
                                        description: 'The currency code (e.g., USD)',
                                    },
                                    {
                                        displayName: 'Type',
                                        name: 'type',
                                        type: 'options',
                                        required: true,
                                        options: [
                                            { name: 'One Time', value: 'one-time' },
                                            { name: 'Recurring', value: 'recurring' },
                                        ],
                                        default: 'one-time',
                                        description: 'The type of price',
                                    },
                                    {
                                        displayName: 'Period',
                                        name: 'period',
                                        type: 'string',
                                        default: '',
                                        description: 'The billing period (required for recurring prices)',
                                        displayOptions: {
                                            show: {
                                                type: ['recurring'],
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        displayName: 'Additional Fields',
                        name: 'additionalFields',
                        type: 'collection',
                        placeholder: 'Add Field',
                        default: {},
                        options: [
                            {
                                displayName: 'Description',
                                name: 'description',
                                type: 'string',
                                default: '',
                                description: 'Description of the service plan',
                            },
                            {
                                displayName: 'Commitment',
                                name: 'commitment',
                                type: 'fixedCollection',
                                typeOptions: {
                                    multipleValues: false,
                                },
                                default: {},
                                description: 'The commitment period for the service plan',
                                options: [
                                    {
                                        name: 'values',
                                        displayName: 'Values',
                                        values: [
                                            {
                                                displayName: 'Count',
                                                name: 'count',
                                                type: 'number',
                                                required: true,
                                                default: 1,
                                                description: 'The number of periods',
                                            },
                                            {
                                                displayName: 'Period',
                                                name: 'period',
                                                type: 'string',
                                                required: true,
                                                default: '',
                                                description: 'The period type (e.g., month, year)',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                displayName: 'Title',
                                name: 'title',
                                type: 'string',
                                default: '',
                                description: 'Title of the service plan',
                            },
                            {
                                displayName: 'Display Order',
                                name: 'displayOrder',
                                type: 'number',
                                default: 0,
                                description: 'Display order of the service plan',
                            },
                        ],
                    },
                ],
            },
            update: {
                name: 'Update',
                value: 'update',
                description: 'Update a service plan',
                action: 'Update a service plan',
                properties: [
                    {
                        displayName: 'Plan ID',
                        name: 'planId',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the service plan to update',
                    },
                    {
                        displayName: 'Update Fields',
                        name: 'updateFields',
                        type: 'collection',
                        placeholder: 'Add Field',
                        default: {},
                        options: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'The name of the service plan',
                            },
                            {
                                displayName: 'Status',
                                name: 'status',
                                type: 'options',
                                options: [
                                    { name: 'Active', value: 'active' },
                                    { name: 'Draft', value: 'draft' },
                                    { name: 'Retired', value: 'retired' },
                                ],
                                default: '',
                                description: 'The status of the service plan',
                            },
                            {
                                displayName: 'Description',
                                name: 'description',
                                type: 'string',
                                default: '',
                                description: 'Description of the service plan',
                            },
                            {
                                displayName: 'Prices',
                                name: 'prices',
                                type: 'fixedCollection',
                                typeOptions: {
                                    multipleValues: true,
                                },
                                default: {},
                                description: 'The prices for the service plan',
                                options: [
                                    {
                                        name: 'price',
                                        displayName: 'Price',
                                        values: [
                                            {
                                                displayName: 'Amount',
                                                name: 'amount',
                                                type: 'string',
                                                required: true,
                                                default: '',
                                                description: 'The price amount',
                                            },
                                            {
                                                displayName: 'Currency',
                                                name: 'currency',
                                                type: 'string',
                                                required: true,
                                                default: '',
                                                description: 'The currency code (e.g., USD)',
                                            },
                                            {
                                                displayName: 'Type',
                                                name: 'type',
                                                type: 'options',
                                                required: true,
                                                options: [
                                                    { name: 'One Time', value: 'one-time' },
                                                    { name: 'Recurring', value: 'recurring' },
                                                ],
                                                default: 'one-time',
                                                description: 'The type of price',
                                            },
                                            {
                                                displayName: 'Period',
                                                name: 'period',
                                                type: 'string',
                                                default: '',
                                                description: 'The billing period (required for recurring prices)',
                                                displayOptions: {
                                                    show: {
                                                        type: ['recurring'],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                displayName: 'Commitment',
                                name: 'commitment',
                                type: 'fixedCollection',
                                typeOptions: {
                                    multipleValues: false,
                                },
                                default: {},
                                description: 'The commitment period for the service plan',
                                options: [
                                    {
                                        name: 'values',
                                        displayName: 'Values',
                                        values: [
                                            {
                                                displayName: 'Count',
                                                name: 'count',
                                                type: 'number',
                                                required: true,
                                                default: 1,
                                                description: 'The number of periods',
                                            },
                                            {
                                                displayName: 'Period',
                                                name: 'period',
                                                type: 'string',
                                                required: true,
                                                default: '',
                                                description: 'The period type (e.g., month, year)',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                displayName: 'Title',
                                name: 'title',
                                type: 'string',
                                default: '',
                                description: 'Title of the service plan',
                            },
                            {
                                displayName: 'Display Order',
                                name: 'displayOrder',
                                type: 'number',
                                default: 0,
                                description: 'Display order of the service plan',
                            },
                        ],
                    },
                ],
            },
        },
        properties: [],
    };

    async loadOptions(
        loadOptionsFunctions: ILoadOptionsFunctions,
        propertyName: string,
        currentNodeParameters: Record<string, unknown>,
    ): Promise<INodePropertyOptions[]> {
        if (propertyName === 'planId') {
            const response = await this.makeRequest<IServicePlanListResponse>(
                loadOptionsFunctions,
                'GET',
                '',
                undefined,
                { limit: 100 },
            );

            if (!response.success || !response.data) {
                throw new Error('Failed to load service plans');
            }

            return response.data.plans.map((plan) => ({
                name: `${plan.name} (${plan.status})`,
                value: plan.id,
            }));
        }

        return [];
    }

    async execute(
        executeFunctions: IExecuteFunctions,
        operation: string,
        i: number,
    ): Promise<IApiResponse<unknown>> {
        let result: IApiResponse<unknown>;

        switch (operation) {
            case 'list': {
                const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
                const additionalFields = executeFunctions.getNodeParameter('additionalFields', i, {}) as IDataObject;
                const filters: IDataObject = {};

                if (additionalFields.status) filters.status = additionalFields.status;
                if (additionalFields.technical) filters.technical = additionalFields.technical;
                if (additionalFields.search) filters.search = additionalFields.search;

                if (returnAll) {
                    result = await this.makeRequest<IServicePlanListResponse>(
                        executeFunctions,
                        'GET',
                        '',
                        undefined,
                        filters,
                    );
                } else {
                    const limit = executeFunctions.getNodeParameter('limit', i, 10) as number;
                    result = await this.makeRequest<IServicePlanListResponse>(
                        executeFunctions,
                        'GET',
                        '',
                        undefined,
                        { ...filters, limit },
                    );
                }
                break;
            }
            case 'get': {
                const id = executeFunctions.getNodeParameter('planId', i) as string;
                result = await this.makeRequest<IServicePlan>(
                    executeFunctions,
                    'GET',
                    `/${id}`,
                );
                break;
            }
            case 'create': {
                const name = executeFunctions.getNodeParameter('name', i) as string;
                const status = executeFunctions.getNodeParameter('status', i) as string;
                const pricesCollection = executeFunctions.getNodeParameter('prices', i) as {
                    price: Array<{
                        amount: string;
                        currency: string;
                        type: 'one-time' | 'recurring';
                        period?: string;
                    }>;
                };
                const additionalFields = executeFunctions.getNodeParameter('additionalFields', i, {}) as IDataObject;

                const data: IDataObject = {
                    name,
                    status,
                    prices: pricesCollection.price,
                };

                // Add additional fields except commitment
                for (const [key, value] of Object.entries(additionalFields)) {
                    if (key !== 'commitment') {
                        data[key] = value;
                    }
                }

                // Add commitment if present
                if (additionalFields.commitment) {
                    const commitment = (additionalFields.commitment as IDataObject).values as IDataObject;
                    data.commitment = {
                        count: commitment.count,
                        period: commitment.period,
                    };
                }

                result = await this.makeRequest<IServicePlan>(
                    executeFunctions,
                    'POST',
                    '',
                    data as unknown as IDataObject,
                );
                break;
            }
            case 'update': {
                const planId = executeFunctions.getNodeParameter('planId', i) as string;
                const updateFields = executeFunctions.getNodeParameter('updateFields', i, {}) as IDataObject;

                // Handle prices update if present
                if (updateFields.prices) {
                    const pricesCollection = updateFields.prices as {
                        price: Array<{
                            amount: string;
                            currency: string;
                            type: 'one-time' | 'recurring';
                            period?: string;
                        }>;
                    };
                    updateFields.prices = pricesCollection.price;
                }

                // Handle commitment update if present
                if (updateFields.commitment) {
                    const commitment = (updateFields.commitment as IDataObject).values as IDataObject;
                    updateFields.commitment = {
                        count: commitment.count,
                        period: commitment.period,
                    };
                }

                result = await this.makeRequest<IServicePlan>(
                    executeFunctions,
                    'PUT',
                    `/${planId}`,
                    updateFields as unknown as IDataObject,
                );
                break;
            }
            default:
                throw new Error(`Operation ${operation} not found`);
        }

        return result;
    }
} 