/**
 * @file Order Resource Descriptions
 * @description Defines the operations and fields available for the Order resource.
 *
 * Contains:
 * - Operation definitions (get, getMany, create, estimate, getResellerOrders, update)
 * - Field descriptions and validation rules
 * - Display options and conditional rendering
 * - Advanced filtering capabilities
 * - Date range filtering support
 *
 * @module CloudBlueCommerceSimpleApi/descriptions/order
 */

import type { INodeProperties } from 'n8n-workflow';
import { PAGINATION, presetDateOptions } from '../../utils/constants';
import { OrderStatus, OrderDetailType } from '../../resources/order/order.types';

// Operations must follow {resource}Operations naming
export const orderOperations: INodeProperties[] = [
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
        name: 'Create',
        value: 'create',
        description: 'Create a new order',
        action: 'Create an order',
      },
      {
        name: 'Estimate',
        value: 'estimate',
        description: 'Estimate order price',
        action: 'Estimate order price',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an order by ID',
        action: 'Get an order',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many orders',
        action: 'Get many orders',
      },
      {
        name: 'Get Reseller Orders',
        value: 'getResellerOrders',
        description: 'Get orders for a specific reseller',
        action: 'Get reseller orders',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update order properties and status',
        action: 'Update an order',
      },
    ],
    default: 'getMany',
  },
];

// Base fields must follow base{Resource}Fields naming
const baseOrderFields: INodeProperties[] = [
  {
    displayName: 'Order ID',
    name: 'id',
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
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['order'],
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
    default: PAGINATION.DEFAULT_LIMIT,
    description: `Max number of results to return (maximum: ${PAGINATION.MAX_LIMIT})`,
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['getMany'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    default: {},
    placeholder: 'Add Filter',
    description: 'Filter the orders',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['getMany'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: Object.values(OrderStatus).map((status) => ({
          name: status
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          value: status,
        })),
        default: '',
        description: 'Filter by order status',
      },
      {
        displayName: 'Detail Type',
        name: 'detailType',
        type: 'options',
        options: Object.values(OrderDetailType).map((type) => ({
          name: type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
          value: type,
        })),
        default: '',
        description: 'Filter by order detail type',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        default: '',
        description: 'The ID of the customer for whom the order was placed',
      },
      {
        displayName: 'Subscription ID',
        name: 'subscriptionId',
        type: 'string',
        default: '',
        description: 'The ID of the subscription created from the order',
      },
      {
        displayName: 'Order Number',
        name: 'orderNumber',
        type: 'string',
        default: '',
        description: 'Order Number',
      },
      {
        displayName: 'Status Code',
        name: 'statusCode',
        type: 'string',
        default: '',
        description: 'Internal status code of the order',
      },
      {
        displayName: 'Created After',
        name: 'creationTimeFrom',
        type: 'collection',
        default: {},
        description:
          'This is the beginning of a specific period of time used to search for orders created during that same period',
        options: [
          {
            displayName: 'Preset Date',
            name: 'presetDate',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: presetDateOptions,
                default: '',
              },
            ],
          },
          {
            displayName: 'Custom Date',
            name: 'datePicker',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Created Before',
        name: 'creationTimeTo',
        type: 'collection',
        default: {},
        description:
          'This is the end of a specific period of time used to search for orders created during that same period',
        options: [
          {
            displayName: 'Preset Date',
            name: 'presetDate',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: presetDateOptions,
                default: '',
              },
            ],
          },
          {
            displayName: 'Custom Date',
            name: 'datePicker',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    displayName: 'Order Data',
    name: 'data',
    type: 'fixedCollection',
    default: {},
    required: true,
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['create', 'estimate'],
      },
    },
    options: [
      {
        name: 'values',
        displayName: 'Values',
        values: [
          {
            displayName: 'Customer ID',
            name: 'customerId',
            type: 'string',
            required: true,
            default: '',
            description: 'The ID of the customer placing the order',
          },
          {
            displayName: 'Products',
            name: 'products',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            required: true,
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
                    description: 'Quantity of the product',
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
    displayName: 'Reseller ID',
    name: 'resellerId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the reseller',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['getResellerOrders'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['getResellerOrders'],
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
    default: PAGINATION.DEFAULT_LIMIT,
    description: `Max number of results to return (maximum: ${PAGINATION.MAX_LIMIT})`,
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['getResellerOrders'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    default: {},
    placeholder: 'Add Filter',
    description: 'Filter the reseller orders',
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['getResellerOrders'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: Object.values(OrderStatus).map((status) => ({
          name: status
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          value: status,
        })),
        default: '',
        description: 'Filter by order status',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        default: '',
        description: 'The ID of the customer for whom the order was placed',
      },
      {
        displayName: 'Subscription ID',
        name: 'subscriptionId',
        type: 'string',
        default: '',
        description: 'The ID of the subscription created from the order',
      },
      {
        displayName: 'Created After',
        name: 'creationTimeFrom',
        type: 'collection',
        default: {},
        description:
          'This is the beginning of a specific period of time used to search for orders created during that same period',
        options: [
          {
            displayName: 'Preset Date',
            name: 'presetDate',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: presetDateOptions,
                default: '',
              },
            ],
          },
          {
            displayName: 'Custom Date',
            name: 'datePicker',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Created Before',
        name: 'creationTimeTo',
        type: 'collection',
        default: {},
        description:
          'This is the end of a specific period of time used to search for orders created during that same period',
        options: [
          {
            displayName: 'Preset Date',
            name: 'presetDate',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: presetDateOptions,
                default: '',
              },
            ],
          },
          {
            displayName: 'Custom Date',
            name: 'datePicker',
            type: 'collection',
            default: {},
            options: [
              {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    displayName: 'Update Data',
    name: 'data',
    type: 'collection',
    default: {},
    required: true,
    displayOptions: {
      show: {
        resource: ['order'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Credit Check',
        name: 'creditCheck',
        type: 'boolean',
        default: false,
        description: "Whether customer's credit should be checked on order processing",
      },
      {
        displayName: 'Status Code',
        name: 'statusCode',
        type: 'string',
        default: '',
        description: 'Internal status code of the order',
      },
    ],
  },
];

// Export only the base fields, operations are exported separately
export const orderFields: INodeProperties[] = baseOrderFields;
