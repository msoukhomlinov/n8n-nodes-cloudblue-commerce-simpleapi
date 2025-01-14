import type {
  IDataObject,
  ILoadOptionsFunctions,
  IExecuteFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IReseller, IResellerListResponse } from '../interfaces/IReseller';
import type { IResource, IPaginatedResponse } from '../interfaces';

export class ResellerResource extends BaseResource {
  protected basePath = '/resellers';
  protected resource: IResource = {
    name: 'Reseller',
    value: 'reseller',
    description: 'Manage resellers in CloudBlue',
    operations: {
      list: {
        name: 'List',
        value: 'list',
        description: 'List all resellers',
        action: 'List all resellers',
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
                  {
                    name: 'Active',
                    value: 'active',
                  },
                  {
                    name: 'Inactive',
                    value: 'inactive',
                  },
                ],
                default: '',
                description: 'Filter resellers by status',
              },
              {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'Filter resellers by external ID',
              },
            ],
          },
        ],
      },
      get: {
        name: 'Get',
        value: 'get',
        description: 'Get a specific reseller',
        action: 'Get a specific reseller',
        properties: [
          {
            displayName: 'Reseller ID',
            name: 'resellerId',
            type: 'string',
            required: true,
            default: '',
            description: 'ID of the reseller to retrieve',
          },
        ],
      },
      create: {
        name: 'Create',
        value: 'create',
        description: 'Create a new reseller',
        action: 'Create a new reseller',
        properties: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            required: true,
            default: '',
            description: 'Name of the reseller',
          },
          {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
              {
                name: 'Active',
                value: 'active',
              },
              {
                name: 'Inactive',
                value: 'inactive',
              },
            ],
            default: 'active',
            description: 'Status of the reseller',
          },
          {
            displayName: 'Contact',
            name: 'contact',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: false,
            },
            default: {},
            options: [
              {
                name: 'value',
                displayName: 'Contact',
                values: [
                  {
                    displayName: 'First Name',
                    name: 'first_name',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'First name of the contact',
                  },
                  {
                    displayName: 'Last Name',
                    name: 'last_name',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Last name of the contact',
                  },
                  {
                    displayName: 'Email',
                    name: 'email',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Email of the contact',
                  },
                  {
                    displayName: 'Phone',
                    name: 'phone',
                    type: 'string',
                    default: '',
                    description: 'Phone number of the contact',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'Address',
            name: 'address',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: false,
            },
            default: {},
            options: [
              {
                name: 'value',
                displayName: 'Address',
                values: [
                  {
                    displayName: 'Line 1',
                    name: 'line1',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'First line of the address',
                  },
                  {
                    displayName: 'Line 2',
                    name: 'line2',
                    type: 'string',
                    default: '',
                    description: 'Second line of the address',
                  },
                  {
                    displayName: 'City',
                    name: 'city',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'City of the address',
                  },
                  {
                    displayName: 'State',
                    name: 'state',
                    type: 'string',
                    default: '',
                    description: 'State of the address',
                  },
                  {
                    displayName: 'Postal Code',
                    name: 'postal_code',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Postal code of the address',
                  },
                  {
                    displayName: 'Country',
                    name: 'country',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Country of the address',
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
                displayName: 'Tax ID',
                name: 'tax_id',
                type: 'string',
                default: '',
                description: 'Tax ID of the reseller',
              },
              {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'External ID of the reseller',
              },
            ],
          },
        ],
      },
      update: {
        name: 'Update',
        value: 'update',
        description: 'Update a reseller',
        action: 'Update a reseller',
        properties: [
          {
            displayName: 'Reseller ID',
            name: 'resellerId',
            type: 'string',
            required: true,
            default: '',
            description: 'ID of the reseller to update',
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
                description: 'Name of the reseller',
              },
              {
                displayName: 'Status',
                name: 'status',
                type: 'options',
                options: [
                  {
                    name: 'Active',
                    value: 'active',
                  },
                  {
                    name: 'Inactive',
                    value: 'inactive',
                  },
                ],
                default: 'active',
                description: 'Status of the reseller',
              },
              {
                displayName: 'Tax ID',
                name: 'tax_id',
                type: 'string',
                default: '',
                description: 'Tax ID of the reseller',
              },
              {
                displayName: 'External ID',
                name: 'external_id',
                type: 'string',
                default: '',
                description: 'External ID of the reseller',
              },
            ],
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
        const paginationParams = this.queryParameterService.extractPaginationParameters(
          executeFunctions,
          i,
        );

        const additionalFields = executeFunctions.getNodeParameter(
          'additionalFields',
          i,
          {},
        ) as IDataObject;
        const filterParams: IDataObject = {};

        if (additionalFields.status) {
          filterParams.status = additionalFields.status;
        }
        if (additionalFields.external_id) {
          filterParams.external_id = additionalFields.external_id;
        }

        if (paginationParams.returnAll) {
          const resellers = await this.paginationService.getPaginatedResults<IReseller>(
            this.apiService,
            executeFunctions,
            this.basePath,
            {
              returnAll: true,
              additionalParams: filterParams,
            },
          );

          return {
            data: resellers,
            pagination: {
              offset: 0,
              limit: resellers.length,
              total: resellers.length,
            },
          };
        }

        return this.makeRequest<IReseller>(executeFunctions, 'GET', '', undefined, {
          ...filterParams,
          limit: paginationParams.limit,
          offset: paginationParams.offset,
        });
      }

      case 'get': {
        const id = executeFunctions.getNodeParameter('resellerId', i) as string;
        return this.makeRequest<IReseller>(executeFunctions, 'GET', `/${id}`);
      }

      case 'create': {
        const name = executeFunctions.getNodeParameter('name', i) as string;
        const status = executeFunctions.getNodeParameter('status', i) as string;
        const contact = (executeFunctions.getNodeParameter('contact', i) as { value: IDataObject })
          .value;

        const params: IDataObject = {
          name,
          status,
          contact,
        };

        return this.makeRequest<IReseller>(executeFunctions, 'POST', '', params);
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
    return [];
  }
}
