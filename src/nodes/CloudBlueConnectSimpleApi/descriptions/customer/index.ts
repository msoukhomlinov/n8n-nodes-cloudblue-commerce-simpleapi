/**
 * @file Customer Resource Description
 * @description Defines operations and fields for the customer resource
 * Implements:
 * - Operation definitions
 * - Field properties and validation
 * - Display options and conditional logic
 *
 * @module CloudBlueConnectSimpleApi/descriptions/customer
 */

import type { INodeProperties } from 'n8n-workflow';
import { PAGINATION } from '../../utils/constants';

export const customerOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['customer'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new customer',
        action: 'Create a customer',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a customer by ID',
        action: 'Get a customer',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many customers',
        action: 'Get many customers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a customer',
        action: 'Update a customer',
      },
    ],
    default: 'getMany',
  },
];

const baseCustomerFields: INodeProperties[] = [
  {
    displayName: 'Customer ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['get', 'update'],
      },
    },
    description: 'The ID of the customer',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    description: 'The name of the customer',
  },
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    options: [
      {
        name: 'Person',
        value: 'person',
      },
      {
        name: 'Company',
        value: 'company',
      },
    ],
    default: 'company',
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    description: 'The type of the customer',
  },
  {
    displayName: 'Contact',
    name: 'contact',
    type: 'fixedCollection',
    default: {},
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    description: 'Contact information for the customer',
    options: [
      {
        name: 'value',
        displayName: 'Contact',
        values: [
          {
            displayName: 'Email',
            name: 'email',
            type: 'string',
            required: true,
            default: '',
            description: 'Email address of the contact person',
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
            displayName: 'Phone',
            name: 'phone',
            type: 'string',
            default: '',
            description: 'Phone number of the contact person',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'fixedCollection',
    default: {},
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create'],
      },
    },
    description: 'Address information for the customer',
    options: [
      {
        name: 'value',
        displayName: 'Address',
        values: [
          {
            displayName: 'Address Line 1',
            name: 'address1',
            type: 'string',
            required: true,
            default: '',
            description: 'First line of the address',
          },
          {
            displayName: 'Address Line 2',
            name: 'address2',
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
            description: 'City name',
          },
          {
            displayName: 'State',
            name: 'state',
            type: 'string',
            default: '',
            description: 'State or province name',
          },
          {
            displayName: 'Postal Code',
            name: 'postalCode',
            type: 'string',
            required: true,
            default: '',
            description: 'Postal or ZIP code',
          },
          {
            displayName: 'Country',
            name: 'country',
            type: 'string',
            required: true,
            default: '',
            description: 'Country name',
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
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the customer',
      },
      {
        displayName: 'External ID',
        name: 'externalId',
        type: 'string',
        default: '',
        description: 'External reference ID for the customer',
      },
      {
        displayName: 'Tax ID',
        name: 'taxId',
        type: 'string',
        default: '',
        description: 'Tax identification number of the customer',
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
        resource: ['customer'],
        operation: ['getMany'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: PAGINATION.DEFAULT_LIMIT,
    description: 'Max number of results to return',
    typeOptions: {
      minValue: 1,
    },
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['getMany'],
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
    displayOptions: {
      show: {
        resource: ['customer'],
        operation: ['getMany'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter customers by name (partial match)',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Filter customers by contact email',
      },
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
    ],
  },
];

export const customerFields: INodeProperties[] = [...customerOperations, ...baseCustomerFields];
