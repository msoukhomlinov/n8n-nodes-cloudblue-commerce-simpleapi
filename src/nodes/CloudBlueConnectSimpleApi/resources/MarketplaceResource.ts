import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IPaginatedResponse } from '../interfaces';
import type { IMarketplace } from '../interfaces/IMarketplace';

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
  ): Promise<IPaginatedResponse<unknown>> {
    switch (operation) {
      case 'list': {
        const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
        const queryParams = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'filters',
            type: 'string',
          },
        ]);

        if (returnAll) {
          const marketplaces = await this.paginationService.getPaginatedResults<IMarketplace>(
            this.apiService,
            executeFunctions,
            this.basePath,
            {
              returnAll: true,
              additionalParams: queryParams,
            },
          );

          return {
            data: marketplaces,
            pagination: {
              offset: 0,
              limit: marketplaces.length,
              total: marketplaces.length,
            },
          };
        }

        const limit = executeFunctions.getNodeParameter('limit', i) as number;
        return this.makeRequest<IMarketplace>(executeFunctions, 'GET', '', undefined, {
          ...queryParams,
          limit,
        });
      }

      case 'get': {
        const id = executeFunctions.getNodeParameter('id', i) as string;
        return this.makeRequest<IMarketplace>(executeFunctions, 'GET', `/${id}`);
      }

      case 'create': {
        const data = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            name: 'description',
            type: 'string',
          },
          {
            name: 'icon',
            type: 'string',
          },
        ]);

        return this.makeRequest<IMarketplace>(executeFunctions, 'POST', '', data);
      }

      case 'update': {
        const id = executeFunctions.getNodeParameter('id', i) as string;
        const data = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'description',
            type: 'string',
          },
          {
            name: 'icon',
            type: 'string',
          },
        ]);

        return this.makeRequest<IMarketplace>(executeFunctions, 'PUT', `/${id}`, data);
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
    if (propertyName === 'marketplaceId') {
      const response = await this.makeRequest<IMarketplace>(
        loadOptionsFunctions,
        'GET',
        '',
        undefined,
        { limit: 100 },
      );

      return response.data.map((marketplace: IMarketplace) => ({
        name: marketplace.name,
        value: marketplace.id,
        description: marketplace.description || '',
      }));
    }

    return [];
  }
}
