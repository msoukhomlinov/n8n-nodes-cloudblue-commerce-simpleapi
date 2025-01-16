/**
 * @file Subscription Resource Descriptions
 * @description Defines the operations and fields available for the Subscription resource.
 * Contains:
 * - Operation definitions (get, getMany, etc.)
 * - Field descriptions and validation rules
 * - Display options and conditional rendering
 *
 * @module CloudBlueConnectSimpleApi/descriptions/subscription
 */

import { PAGINATION, presetDateOptions } from '../../utils/constants';
import { SubscriptionStatus } from '../../resources/subscription/subscription.types';

export const operations = {
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
      name: 'Get',
      value: 'get',
      description: 'Get a subscription by ID',
      action: 'Get a subscription',
    },
    {
      name: 'Get Many',
      value: 'getMany',
      description: 'Get many subscriptions',
      action: 'Get many subscriptions',
    },
    {
      name: 'Update',
      value: 'update',
      description: 'Update a subscription',
      action: 'Update a subscription',
    },
    {
      name: 'Update Special Pricing',
      value: 'updateSpecialPricing',
      description: 'Update special pricing for a subscription',
      action: 'Update subscription special pricing',
    },
  ],
  default: 'getMany',
} as const;

export const fields = {
  subscriptionId: {
    displayName: 'Subscription ID',
    name: 'subscriptionId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the subscription',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['get', 'update', 'updateSpecialPricing'],
      },
    },
  },
  updateData: {
    displayName: 'Data',
    name: 'data',
    type: 'collection',
    required: true,
    default: {},
    placeholder: 'Add Field',
    description: 'The data to update the subscription with',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'string',
        default: '',
        description: 'The status of the subscription',
      },
    ],
  },
  specialPricingData: {
    displayName: 'Data',
    name: 'data',
    type: 'collection',
    required: true,
    default: {},
    placeholder: 'Add Field',
    description: 'The special pricing data',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['updateSpecialPricing'],
      },
    },
    options: [
      {
        displayName: 'Price',
        name: 'price',
        type: 'number',
        default: 0,
        description: 'The special price for the subscription',
      },
    ],
  },
  returnAll: {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getMany'],
      },
    },
  },
  limit: {
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
        resource: ['subscription'],
        operation: ['getMany'],
        returnAll: [false],
      },
    },
  },
  filters: {
    displayName: 'Filters',
    name: 'params',
    type: 'collection',
    default: {},
    placeholder: 'Add Filter',
    description: 'Filter the results',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getMany'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: Object.values(SubscriptionStatus).map((status) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
        })),
        default: SubscriptionStatus.ACTIVE,
        description: 'Filter subscriptions by status',
      },
      {
        displayName: 'Creation After',
        name: 'creationDateFrom',
        type: 'fixedCollection',
        default: { preset: 'today' },
        options: [
          {
            displayName: 'Date Picker',
            name: 'datePicker',
            values: [
              {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
              },
            ],
          },
          {
            displayName: 'Preset Date',
            name: 'presetDate',
            values: [
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: presetDateOptions,
                default: 'today',
              },
            ],
          },
        ],
        description: 'Filter subscriptions created after this date or preset',
      },
      {
        displayName: 'Creation Before',
        name: 'creationDateTo',
        type: 'fixedCollection',
        default: { preset: 'today' },
        options: [
          {
            displayName: 'Date Picker',
            name: 'datePicker',
            values: [
              {
                displayName: 'Date',
                name: 'date',
                type: 'dateTime',
                default: '',
              },
            ],
          },
          {
            displayName: 'Preset Date',
            name: 'presetDate',
            values: [
              {
                displayName: 'Preset',
                name: 'preset',
                type: 'options',
                options: presetDateOptions,
                default: 'today',
              },
            ],
          },
        ],
        description: 'Filter subscriptions created before this date or preset',
      },
      {
        displayName: 'Product ID',
        name: 'product_id',
        type: 'string',
        default: '',
        description: 'Filter by product ID',
      },
      {
        displayName: 'Marketplace ID',
        name: 'marketplace_id',
        type: 'string',
        default: '',
        description: 'Filter by marketplace ID',
      },
      {
        displayName: 'Connection ID',
        name: 'connection_id',
        type: 'string',
        default: '',
        description: 'Filter by connection ID',
      },
    ],
  },
} as const;
