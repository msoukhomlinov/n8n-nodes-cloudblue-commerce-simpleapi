import type {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    IDataObject,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IApiResponse } from '../interfaces';

interface IMarketplace extends IDataObject {
    /** The marketplace ID (e.g., "MP-123") */
    readonly id: string;
    /** The name of the marketplace (e.g., "US Marketplace") */
    name: string;
    /** The description of the marketplace (e.g., "CloudBlue US Marketplace") */
    description?: string;
    /** The URL of the marketplace icon (e.g., "https://example.com/icon.png") */
    icon?: string;
    /** The owner information */
    owner: {
        /** The owner ID (e.g., "OW-123") */
        readonly id: string;
        /** The owner name (e.g., "CloudBlue") */
        name: string;
    };
    /** The currency code for the marketplace (e.g., "USD") */
    currency: string;
    /** Whether the marketplace is active */
    active: boolean;
    /** The unique code for the marketplace (e.g., "us") */
    code?: string;
    /** The status of the marketplace (e.g., "active") */
    status?: 'pending' | 'active' | 'creditHold' | 'adminHold' | 'cancelled' | 'error';
    /** The type of marketplace (e.g., "distribution") */
    type?: string;
    /** The external ID for the marketplace (e.g., "EXTERNAL-MP-123") */
    externalId?: string;
    /** Custom attributes for the marketplace */
    attributes?: Record<string, string>;
    /** Contact information for the marketplace */
    contactInfo?: {
        /** First line of the address (e.g., "123 Main St") */
        address_line1?: string;
        /** Second line of the address (e.g., "Suite 100") */
        address_line2?: string;
        /** City (e.g., "San Francisco") */
        city?: string;
        /** State or province (e.g., "CA") */
        state?: string;
        /** Postal code (e.g., "94105") */
        postal_code?: string;
        /** Country (e.g., "US") */
        country?: string;
        /** Contact person name (e.g., "John Doe") */
        contact_name?: string;
        /** Contact email address (e.g., "john.doe@example.com") */
        contact_email?: string;
        /** Contact phone number (e.g., "+1-555-555-5555") */
        contact_phone?: string;
    };
}

interface IResultList<T> {
    data: T[];
    pagination: {
        offset: number;
        limit: number;
        total: number;
    };
}

export class MarketplaceResource extends BaseResource {
    protected basePath = '/marketplaces';
    protected resource: IResource = {
        name: 'Marketplace',
        value: 'marketplace',
        description: 'Manage marketplaces in CloudBlue',
        operations: {
            list: {
                name: 'List',
                value: 'list',
                description: 'List all marketplaces',
                action: 'List all marketplaces',
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
                        description: 'Max number of results to return (minimum: 1)',
                        displayOptions: {
                            show: {
                                returnAll: [false],
                            },
                        },
                    },
                    {
                        displayName: 'Filters',
                        name: 'filters',
                        type: 'collection',
                        placeholder: 'Add Filter',
                        default: {},
                        options: [
                            {
                                displayName: 'Active',
                                name: 'active',
                                type: 'boolean',
                                default: true,
                                description: 'Filter by active status',
                            },
                            {
                                displayName: 'Currency',
                                name: 'currency',
                                type: 'options',
                                options: [
                                    { name: 'USD', value: 'USD' },
                                    { name: 'EUR', value: 'EUR' },
                                    { name: 'GBP', value: 'GBP' },
                                    { name: 'AUD', value: 'AUD' },
                                    { name: 'CAD', value: 'CAD' },
                                    { name: 'JPY', value: 'JPY' },
                                    { name: 'CNY', value: 'CNY' },
                                    { name: 'INR', value: 'INR' },
                                ],
                                default: 'USD',
                                description: 'Filter by currency',
                            },
                            {
                                displayName: 'Type',
                                name: 'type',
                                type: 'string',
                                default: '',
                                description: 'Filter by marketplace type',
                            },
                            {
                                displayName: 'Status',
                                name: 'status',
                                type: 'options',
                                options: [
                                    { name: 'Pending', value: 'pending' },
                                    { name: 'Active', value: 'active' },
                                    { name: 'Credit Hold', value: 'creditHold' },
                                    { name: 'Admin Hold', value: 'adminHold' },
                                    { name: 'Cancelled', value: 'cancelled' },
                                    { name: 'Error', value: 'error' },
                                ],
                                default: '',
                                description: 'Filter by marketplace status',
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
                description: 'Get a marketplace by ID',
                action: 'Get a marketplace',
                properties: [
                    {
                        displayName: 'Marketplace ID',
                        name: 'id',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the marketplace to retrieve',
                    },
                ],
            },
            create: {
                name: 'Create',
                value: 'create',
                description: 'Create a new marketplace',
                action: 'Create a marketplace',
                properties: [
                    {
                        displayName: 'Required Fields',
                        name: 'requiredFields',
                        type: 'collection',
                        placeholder: 'Add Required Field',
                        default: {},
                        required: true,
                        options: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                required: true,
                                default: '',
                                description: 'Name of the marketplace (e.g., "US Marketplace")',
                            },
                            {
                                displayName: 'Currency',
                                name: 'currency',
                                type: 'options',
                                options: [
                                    { name: 'USD', value: 'USD' },
                                    { name: 'EUR', value: 'EUR' },
                                    { name: 'GBP', value: 'GBP' },
                                    { name: 'AUD', value: 'AUD' },
                                    { name: 'CAD', value: 'CAD' },
                                    { name: 'JPY', value: 'JPY' },
                                    { name: 'CNY', value: 'CNY' },
                                    { name: 'INR', value: 'INR' },
                                ],
                                default: 'AUD',
                                required: true,
                                description: 'Currency for the marketplace (e.g., "USD")',
                            },
                            {
                                displayName: 'Active',
                                name: 'active',
                                type: 'boolean',
                                default: true,
                                required: true,
                                description: 'Whether the marketplace is active',
                            },
                        ],
                    },
                    {
                        displayName: 'Optional Fields',
                        name: 'optionalFields',
                        type: 'collection',
                        placeholder: 'Add Optional Field',
                        default: {},
                        options: [
                            {
                                displayName: 'Description',
                                name: 'description',
                                type: 'string',
                                default: '',
                                description: 'Description of the marketplace (e.g., "CloudBlue US Marketplace")',
                            },
                            {
                                displayName: 'Icon',
                                name: 'icon',
                                type: 'string',
                                default: '',
                                description: 'URL of the marketplace icon (e.g., "https://example.com/icon.png")',
                            },
                            {
                                displayName: 'Type',
                                name: 'type',
                                type: 'string',
                                default: '',
                                description: 'Type of the marketplace (e.g., "distribution")',
                            },
                            {
                                displayName: 'Code',
                                name: 'code',
                                type: 'string',
                                default: '',
                                description: 'Unique code for the marketplace (e.g., "us")',
                            },
                            {
                                displayName: 'External ID',
                                name: 'externalId',
                                type: 'string',
                                default: '',
                                description: 'External ID for the marketplace (e.g., "EXTERNAL-MP-123")',
                            },
                            {
                                displayName: 'Attributes',
                                name: 'attributes',
                                type: 'fixedCollection',
                                typeOptions: {
                                    multipleValues: true,
                                },
                                default: {},
                                options: [
                                    {
                                        name: 'attribute',
                                        displayName: 'Attribute',
                                        values: [
                                            {
                                                displayName: 'Key',
                                                name: 'key',
                                                type: 'string',
                                                default: '',
                                                description: 'Key of the attribute (e.g., "category")',
                                            },
                                            {
                                                displayName: 'Value',
                                                name: 'value',
                                                type: 'string',
                                                default: '',
                                                description: 'Value of the attribute (e.g., "enterprise")',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                displayName: 'Contact Information',
                                name: 'contactInfo',
                                type: 'collection',
                                placeholder: 'Add Contact Information',
                                default: {},
                                options: [
                                    {
                                        displayName: 'Address Line 1',
                                        name: 'address_line1',
                                        type: 'string',
                                        default: '',
                                        description: 'First line of the address (e.g., "123 Main St")',
                                    },
                                    {
                                        displayName: 'Address Line 2',
                                        name: 'address_line2',
                                        type: 'string',
                                        default: '',
                                        description: 'Second line of the address (e.g., "Suite 100")',
                                    },
                                    {
                                        displayName: 'City',
                                        name: 'city',
                                        type: 'string',
                                        default: '',
                                        description: 'City (e.g., "San Francisco")',
                                    },
                                    {
                                        displayName: 'State',
                                        name: 'state',
                                        type: 'string',
                                        default: '',
                                        description: 'State or province (e.g., "CA")',
                                    },
                                    {
                                        displayName: 'Postal Code',
                                        name: 'postal_code',
                                        type: 'string',
                                        default: '',
                                        description: 'Postal code (e.g., "94105")',
                                    },
                                    {
                                        displayName: 'Country',
                                        name: 'country',
                                        type: 'string',
                                        default: '',
                                        description: 'Country (e.g., "US")',
                                    },
                                    {
                                        displayName: 'Contact Name',
                                        name: 'contact_name',
                                        type: 'string',
                                        default: '',
                                        description: 'Contact person name (e.g., "John Doe")',
                                    },
                                    {
                                        displayName: 'Contact Email',
                                        name: 'contact_email',
                                        type: 'string',
                                        default: '',
                                        description: 'Contact email address (e.g., "john.doe@example.com")',
                                    },
                                    {
                                        displayName: 'Contact Phone',
                                        name: 'contact_phone',
                                        type: 'string',
                                        default: '',
                                        description: 'Contact phone number (e.g., "+1-555-555-5555")',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            update: {
                name: 'Update',
                value: 'update',
                description: 'Update a marketplace',
                action: 'Update a marketplace',
                properties: [
                    {
                        displayName: 'Marketplace ID',
                        name: 'id',
                        type: 'string',
                        required: true,
                        default: '',
                        description: 'The ID of the marketplace to update',
                    },
                    {
                        displayName: 'Data',
                        name: 'data',
                        type: 'collection',
                        placeholder: 'Add Field',
                        default: {},
                        options: [
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'New name of the marketplace',
                            },
                            {
                                displayName: 'Description',
                                name: 'description',
                                type: 'string',
                                default: '',
                                description: 'New description of the marketplace',
                            },
                            {
                                displayName: 'Currency',
                                name: 'currency',
                                type: 'options',
                                options: [
                                    { name: 'USD', value: 'USD' },
                                    { name: 'EUR', value: 'EUR' },
                                    { name: 'GBP', value: 'GBP' },
                                    { name: 'AUD', value: 'AUD' },
                                    { name: 'CAD', value: 'CAD' },
                                    { name: 'JPY', value: 'JPY' },
                                    { name: 'CNY', value: 'CNY' },
                                    { name: 'INR', value: 'INR' },
                                ],
                                default: 'USD',
                                description: 'New currency for the marketplace',
                            },
                            {
                                displayName: 'Icon',
                                name: 'icon',
                                type: 'string',
                                default: '',
                                description: 'New URL of the marketplace icon',
                            },
                            {
                                displayName: 'Active',
                                name: 'active',
                                type: 'boolean',
                                default: true,
                                description: 'Whether the marketplace should be active',
                            },
                            {
                                displayName: 'Type',
                                name: 'type',
                                type: 'string',
                                default: '',
                                description: 'New type of the marketplace',
                            },
                            {
                                displayName: 'Code',
                                name: 'code',
                                type: 'string',
                                default: '',
                                description: 'New unique code for the marketplace',
                            },
                            {
                                displayName: 'Contact Information',
                                name: 'contactInfo',
                                type: 'collection',
                                placeholder: 'Add Contact Info',
                                default: {},
                                options: [
                                    {
                                        displayName: 'Address Line 1',
                                        name: 'address_line1',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'Address Line 2',
                                        name: 'address_line2',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'City',
                                        name: 'city',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'State',
                                        name: 'state',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'Postal Code',
                                        name: 'postal_code',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'Country',
                                        name: 'country',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'Contact Name',
                                        name: 'contact_name',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'Contact Email',
                                        name: 'contact_email',
                                        type: 'string',
                                        default: '',
                                    },
                                    {
                                        displayName: 'Contact Phone',
                                        name: 'contact_phone',
                                        type: 'string',
                                        default: '',
                                    },
                                ],
                            },
                            {
                                displayName: 'Attributes',
                                name: 'attributes',
                                type: 'json',
                                default: '{}',
                                description: 'Custom attributes for the marketplace',
                            },
                        ],
                        required: true,
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
    ): Promise<IApiResponse<IMarketplace | IResultList<IMarketplace>>> {
        const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
        const filters = executeFunctions.getNodeParameter('filters', i, {}) as IDataObject;
        const queryParams: IDataObject = {};

        if (filters.active !== undefined) queryParams.active = filters.active;
        if (filters.currency) queryParams.currency = filters.currency;
        if (filters.type) queryParams.type = filters.type;
        if (filters.status) queryParams.status = filters.status;
        if (filters.offset) queryParams.offset = filters.offset;

        switch (operation) {
            case 'list': {
                if (returnAll) {
                    const response = await this.makeRequest<IResultList<IMarketplace>>(
                        executeFunctions,
                        'GET',
                        '',
                        undefined,
                        queryParams,
                    );
                    return response;
                }
                
                const limit = executeFunctions.getNodeParameter('limit', i, 10) as number;
                return this.makeRequest<IResultList<IMarketplace>>(
                    executeFunctions,
                    'GET',
                    '',
                    undefined,
                    { ...queryParams, limit },
                );
            }
            case 'get': {
                const id = executeFunctions.getNodeParameter('id', i) as string;
                return this.makeRequest<IMarketplace>(
                    executeFunctions,
                    'GET',
                    `/${id}`,
                );
            }
            case 'create': {
                const requiredFields = executeFunctions.getNodeParameter('requiredFields', i) as IDataObject;
                const optionalFields = executeFunctions.getNodeParameter('optionalFields', i) as IDataObject;
                
                const data = {
                    ...requiredFields,
                    ...optionalFields,
                };

                return this.makeRequest<IMarketplace>(
                    executeFunctions,
                    'POST',
                    '',
                    data,
                );
            }
            case 'update': {
                const id = executeFunctions.getNodeParameter('id', i) as string;
                const data = executeFunctions.getNodeParameter('data', i) as IDataObject;

                return this.makeRequest<IMarketplace>(
                    executeFunctions,
                    'PUT',
                    `/${id}`,
                    data,
                );
            }
            default: {
                throw new Error(`The operation "${operation}" is not supported!`);
            }
        }
    }

    async loadOptions(
        loadOptionsFunctions: ILoadOptionsFunctions,
        propertyName: string,
        currentNodeParameters: Record<string, unknown>,
    ): Promise<Array<{ name: string; value: string }>> {
        if (propertyName === 'marketplaceId') {
            const response = await this.makeRequest<IResultList<IMarketplace>>(
                loadOptionsFunctions,
                'GET',
                '',
                undefined,
                { limit: 100 },
            );

            if (!response.success || !response.data) {
                throw new Error('Failed to load marketplaces');
            }

            return (response.data.data).map((marketplace) => ({
                name: marketplace.name,
                value: marketplace.id,
            }));
        }

        return [];
    }
} 