import type {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    IDataObject,
    INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IApiResponse } from '../interfaces';
import type { ISubscription, ISubscriptionListResponse } from '../interfaces/ISubscription';

export class SubscriptionResource extends BaseResource {
    protected basePath = '/subscriptions';
    protected resource: IResource = {
        name: 'Subscription',
        value: 'subscription',
        description: 'Manage subscriptions in CloudBlue',
        operations: {
            list: {
                name: 'List',
                value: 'list',
                description: 'List all subscriptions',
                action: 'List all subscriptions',
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
                                description: 'Filter subscriptions by customer ID',
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
                description: 'Get a subscription by ID',
                action: 'Get a subscription',
                properties: [
                    {
                        displayName: 'Subscription ID',
                        name: 'id',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the subscription to retrieve',
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
                response = await this.makeRequest<ISubscription>(
                    executeFunctions,
                    'GET',
                    `/${id}`,
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
        if (propertyName === 'subscriptionId') {
            const response = await this.makeRequest<ISubscriptionListResponse>(
                loadOptionsFunctions,
                'GET',
                '',
                undefined,
                { limit: 100 },
            );

            if (!response.success || !response.data) {
                throw new Error('Failed to load subscriptions');
            }

            return response.data.subscriptions.map((subscription) => ({
                name: `${subscription.id} (${subscription.status})`,
                value: subscription.id,
            }));
        }

        return [];
    }
} 