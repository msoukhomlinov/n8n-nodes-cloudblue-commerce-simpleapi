import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IResource, IPaginatedResponse } from '../interfaces';
import type { ICustomer } from '../interfaces/ICustomer';

interface IAddress {
  streetAddress: string;
  addressExtension?: string;
  postalCode: string;
  city: string;
  state?: string;
  countryCode: string;
  countryName?: string;
}

interface IContactPerson {
  type: 'admin' | 'billing' | 'technical';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  login?: string;
}

export class CustomerResource extends BaseResource {
  protected basePath = '/customers';
  protected resource: IResource = {
    name: 'Customer',
    value: 'customer',
    description: 'Manage customers in CloudBlue',
    operations: {
      list: {
        name: 'List',
        value: 'list',
        description: 'List all customers',
        action: 'List all customers',
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
                displayName: 'External ID',
                name: 'externalId',
                type: 'string',
                default: '',
                description: 'Filter customers by external ID',
              },
              {
                displayName: 'Reseller ID',
                name: 'resellerId',
                type: 'string',
                default: '',
                description: 'Filter customers by reseller ID',
              },
              {
                displayName: 'Hub ID',
                name: 'hubId',
                type: 'string',
                default: '',
                description: 'Filter customers by hub ID',
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
        description: 'Get a customer by ID',
        action: 'Get a customer',
        properties: [
          {
            displayName: 'Customer ID',
            name: 'id',
            type: 'string',
            required: true,
            default: '',
            description: 'The ID of the customer to retrieve',
          },
        ],
      },
      create: {
        name: 'Create',
        value: 'create',
        description: 'Create a new customer',
        action: 'Create a new customer',
        properties: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            required: true,
            default: '',
            description: 'The name of the customer',
          },
          {
            displayName: 'Language',
            name: 'language',
            type: 'string',
            required: true,
            default: 'en',
            description: 'Language for notifications and user panel login',
          },
          {
            displayName: 'Address',
            name: 'address',
            type: 'collection',
            required: true,
            default: {},
            options: [
              {
                displayName: 'Street Address',
                name: 'streetAddress',
                type: 'string',
                required: true,
                default: '',
                description: 'The street address (e.g., 555 Main Street)',
              },
              {
                displayName: 'Address Extension',
                name: 'addressExtension',
                type: 'string',
                default: '',
                description:
                  'Secondary information in the address such as apartment or suite number (e.g., Suite 100)',
              },
              {
                displayName: 'Postal Code',
                name: 'postalCode',
                type: 'string',
                required: true,
                default: '',
                description: 'The postal code (e.g., 92612)',
              },
              {
                displayName: 'City',
                name: 'city',
                type: 'string',
                required: true,
                default: '',
                description: 'The city (e.g., Irvine)',
              },
              {
                displayName: 'State',
                name: 'state',
                type: 'string',
                default: '',
                description: 'The state (if applicable) (e.g., CA)',
              },
              {
                displayName: 'Country Code',
                name: 'countryCode',
                type: 'string',
                required: true,
                default: '',
                description:
                  'The two uppercase character country code (Alpha-2 code) as specified by ISO.3166-1 (e.g., US)',
              },
            ],
          },
          {
            displayName: 'Contact Persons',
            name: 'contactPersons',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            required: true,
            default: {},
            options: [
              {
                name: 'contactPerson',
                displayName: 'Contact Person',
                values: [
                  {
                    displayName: 'Type',
                    name: 'type',
                    type: 'options',
                    options: [
                      { name: 'Admin', value: 'admin' },
                      { name: 'Billing', value: 'billing' },
                      { name: 'Technical', value: 'technical' },
                    ],
                    default: 'admin',
                    description: 'Type of contact person',
                  },
                  {
                    displayName: 'First Name',
                    name: 'firstName',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'First name of the contact person',
                  },
                  {
                    displayName: 'Last Name',
                    name: 'lastName',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Last name of the contact person',
                  },
                  {
                    displayName: 'Email',
                    name: 'email',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Email address of the contact person',
                  },
                  {
                    displayName: 'Phone Number',
                    name: 'phoneNumber',
                    type: 'string',
                    required: true,
                    default: '',
                    description: 'Phone number in ITU-T E.164 notation (e.g., 81##18881234567#)',
                  },
                  {
                    displayName: 'Login',
                    name: 'login',
                    type: 'string',
                    default: '',
                    description: 'Login name for admin type contacts (only for admin type)',
                    displayOptions: {
                      show: {
                        type: ['admin'],
                      },
                    },
                  },
                  {
                    displayName: 'Password',
                    name: 'password',
                    type: 'string',
                    typeOptions: {
                      password: true,
                    },
                    default: '',
                    description: 'Password for admin type contacts (only for admin type)',
                    displayOptions: {
                      show: {
                        type: ['admin'],
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
                displayName: 'External ID',
                name: 'externalId',
                type: 'string',
                default: '',
                description: 'External identifier for the customer',
              },
              {
                displayName: 'Tax Registration ID',
                name: 'taxRegId',
                type: 'string',
                default: '',
                description: 'Tax registration ID for tax calculation and exemption',
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
                        description: 'Name of the attribute',
                      },
                      {
                        displayName: 'Value',
                        name: 'value',
                        type: 'string',
                        default: '',
                        description: 'Value of the attribute',
                      },
                    ],
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
        description: 'Update a customer',
        action: 'Update a customer',
        properties: [
          {
            displayName: 'Customer ID',
            name: 'id',
            type: 'string',
            required: true,
            default: '',
            description: 'The ID of the customer to update',
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
                description: 'The name of the customer',
              },
              {
                displayName: 'External ID',
                name: 'externalId',
                type: 'string',
                default: '',
                description: 'External identifier for the customer',
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Description of the customer',
              },
              {
                displayName: 'Language',
                name: 'language',
                type: 'string',
                default: '',
                description: 'Language for notifications and user panel login',
              },
              {
                displayName: 'Tax Registration ID',
                name: 'taxRegId',
                type: 'string',
                default: '',
                description: 'Tax registration ID for tax calculation and exemption',
              },
              {
                displayName: 'Address',
                name: 'address',
                type: 'fixedCollection',
                default: {},
                options: [
                  {
                    name: 'addressFields',
                    displayName: 'Address Fields',
                    values: [
                      {
                        displayName: 'Street Address',
                        name: 'streetAddress',
                        type: 'string',
                        default: '',
                        description: 'First line of the address',
                      },
                      {
                        displayName: 'Address Extension',
                        name: 'addressExtension',
                        type: 'string',
                        default: '',
                        description:
                          'Secondary information in the address such as apartment or suite',
                      },
                      {
                        displayName: 'Postal Code',
                        name: 'postalCode',
                        type: 'string',
                        default: '',
                        description: 'Postal code',
                      },
                      {
                        displayName: 'City',
                        name: 'city',
                        type: 'string',
                        default: '',
                        description: 'City name',
                      },
                      {
                        displayName: 'State',
                        name: 'state',
                        type: 'string',
                        default: '',
                        description: 'State or province',
                      },
                      {
                        displayName: 'Country Code',
                        name: 'countryCode',
                        type: 'string',
                        default: '',
                        description: 'Country code (ISO 3166-1 alpha-2)',
                      },
                      {
                        displayName: 'Country Name',
                        name: 'countryName',
                        type: 'string',
                        default: '',
                        description: 'Full country name',
                      },
                    ],
                  },
                ],
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
                        displayName: 'Name',
                        name: 'name',
                        type: 'string',
                        default: '',
                        description: 'Name of the attribute',
                      },
                      {
                        displayName: 'Value',
                        name: 'value',
                        type: 'string',
                        default: '',
                        description: 'Value of the attribute',
                      },
                    ],
                  },
                ],
              },
              {
                displayName: 'Contact Persons',
                name: 'contactPersons',
                type: 'fixedCollection',
                typeOptions: {
                  multipleValues: true,
                },
                default: {},
                options: [
                  {
                    name: 'contactPerson',
                    displayName: 'Contact Person',
                    values: [
                      {
                        displayName: 'Type',
                        name: 'type',
                        type: 'options',
                        options: [
                          { name: 'Admin', value: 'admin' },
                          { name: 'Billing', value: 'billing' },
                          { name: 'Technical', value: 'technical' },
                        ],
                        default: 'admin',
                        description: 'Type of contact person',
                      },
                      {
                        displayName: 'First Name',
                        name: 'firstName',
                        type: 'string',
                        default: '',
                        description: 'First name of the contact person',
                      },
                      {
                        displayName: 'Last Name',
                        name: 'lastName',
                        type: 'string',
                        default: '',
                        description: 'Last name of the contact person',
                      },
                      {
                        displayName: 'Email',
                        name: 'email',
                        type: 'string',
                        default: '',
                        description: 'Email address of the contact person',
                      },
                      {
                        displayName: 'Phone Number',
                        name: 'phoneNumber',
                        type: 'string',
                        default: '',
                        description: 'Phone number in ITU-T E.164 notation',
                      },
                      {
                        displayName: 'Login',
                        name: 'login',
                        type: 'string',
                        default: '',
                        description: 'Login name for admin type contacts',
                        displayOptions: {
                          show: {
                            type: ['admin'],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      getOrders: {
        name: 'Get Orders',
        value: 'getOrders',
        description: 'Get orders for a specific customer',
        action: 'Get customer orders',
        properties: [
          {
            displayName: 'Customer ID',
            name: 'customerId',
            type: 'string',
            required: true,
            default: '',
            description: 'ID of the customer to get orders for',
          },
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
                    name: 'Submitted',
                    value: 'submitted',
                  },
                  {
                    name: 'Processing',
                    value: 'processing',
                  },
                  {
                    name: 'Error',
                    value: 'error',
                  },
                  {
                    name: 'Completed',
                    value: 'completed',
                  },
                  {
                    name: 'Cancelled',
                    value: 'cancelled',
                  },
                ],
                default: '',
                description: 'Filter orders by status',
              },
              {
                displayName: 'Creation Time From',
                name: 'creationTimeFrom',
                type: 'dateTime',
                default: '',
                description: 'Filter orders created after this date (ISO 8601)',
              },
              {
                displayName: 'Creation Time To',
                name: 'creationTimeTo',
                type: 'dateTime',
                default: '',
                description: 'Filter orders created before this date (ISO 8601)',
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
    if (propertyName === 'customerId') {
      const response = await this.makeRequest<ICustomer>(
        loadOptionsFunctions,
        'GET',
        '',
        undefined,
        { limit: 100 },
      );

      return response.data.map((customer: ICustomer) => ({
        name: customer.name,
        value: customer.id,
        description: customer.description || '',
      }));
    }

    return [];
  }

  async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IPaginatedResponse<unknown>> {
    switch (operation) {
      case 'list': {
        const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
        const additionalFields = executeFunctions.getNodeParameter(
          'additionalFields',
          i,
          {},
        ) as IDataObject;
        const qs: IDataObject = {};

        if (additionalFields.status) {
          qs.status = additionalFields.status;
        }
        if (additionalFields.externalId) {
          qs.external_id = additionalFields.externalId;
        }

        if (returnAll) {
          const customers = await this.paginationService.getPaginatedResults<ICustomer>(
            this.apiService,
            executeFunctions,
            this.basePath,
            {
              returnAll: true,
              additionalParams: qs,
            },
          );

          return {
            data: customers,
            pagination: {
              offset: 0,
              limit: customers.length,
              total: customers.length,
            },
          };
        }

        const limit = executeFunctions.getNodeParameter('limit', i) as number;
        qs.limit = limit;
        return this.makeRequest<ICustomer>(executeFunctions, 'GET', '', undefined, qs);
      }

      case 'get': {
        const id = executeFunctions.getNodeParameter('id', i) as string;
        return this.makeRequest<ICustomer>(executeFunctions, 'GET', `/${id}`);
      }

      case 'create': {
        const name = executeFunctions.getNodeParameter('name', i) as string;
        const additionalFields = executeFunctions.getNodeParameter(
          'additionalFields',
          i,
          {},
        ) as IDataObject;

        const body: IDataObject = {
          name,
        };

        if (additionalFields.externalId) {
          body.external_id = additionalFields.externalId;
        }
        if (additionalFields.description) {
          body.description = additionalFields.description;
        }

        return this.makeRequest<ICustomer>(executeFunctions, 'POST', '', body);
      }

      case 'update': {
        const id = executeFunctions.getNodeParameter('id', i) as string;
        const updateFields = executeFunctions.getNodeParameter(
          'updateFields',
          i,
          {},
        ) as IDataObject;

        const body: IDataObject = {};

        if (updateFields.name) {
          body.name = updateFields.name;
        }
        if (updateFields.externalId) {
          body.external_id = updateFields.externalId;
        }
        if (updateFields.description) {
          body.description = updateFields.description;
        }

        return this.makeRequest<ICustomer>(executeFunctions, 'PUT', `/${id}`, body);
      }

      default:
        throw new Error(`Operation ${operation} not found`);
    }
  }
}
