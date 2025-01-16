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
    displayName: 'Update Fields',
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
        displayName: 'Renewal Status',
        name: 'renewalStatus',
        type: 'boolean',
        default: false,
        description: 'Whether the subscription should auto-renew',
      },
      {
        displayName: 'Attributes',
        name: 'attributes',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: 'Add Attribute',
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
      {
        displayName: 'Products',
        name: 'products',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        placeholder: 'Add Product',
        options: [
          {
            name: 'product',
            displayName: 'Product',
            values: [
              {
                displayName: 'MPN',
                name: 'mpn',
                type: 'string',
                default: '',
                description: 'Manufacturer Part Number',
              },
              {
                displayName: 'ID',
                name: 'id',
                type: 'string',
                default: '',
                description: 'Product ID',
              },
              {
                displayName: 'Unit Price',
                name: 'unitPrice',
                type: 'fixedCollection',
                default: {},
                options: [
                  {
                    name: 'price',
                    displayName: 'Price',
                    values: [
                      {
                        displayName: 'Currency',
                        name: 'currency',
                        type: 'string',
                        default: '',
                        description: 'Currency code (e.g. USD)',
                      },
                      {
                        displayName: 'Amount',
                        name: 'amount',
                        type: 'string',
                        default: '',
                        description: 'Price amount',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  specialPricingData: {
    displayName: 'Special Pricing',
    name: 'data',
    type: 'fixedCollection',
    required: true,
    default: {
      products: [],
    },
    description: 'The special pricing data for products',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['updateSpecialPricing'],
      },
    },
    options: [
      {
        displayName: 'Products',
        name: 'products',
        values: [
          {
            displayName: 'Product',
            name: 'product',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            required: true,
            description: 'Product to update pricing for',
            options: [
              {
                name: 'values',
                displayName: 'Values',
                values: [
                  {
                    displayName: 'MPN',
                    name: 'mpn',
                    type: 'string',
                    default: '',
                    description: 'Manufacturer Part Number',
                  },
                  {
                    displayName: 'ID',
                    name: 'id',
                    type: 'string',
                    default: '',
                    description: 'Product ID',
                  },
                  {
                    displayName: 'Unit Price',
                    name: 'unitPrice',
                    type: 'fixedCollection',
                    default: {},
                    options: [
                      {
                        name: 'price',
                        displayName: 'Price',
                        values: [
                          {
                            displayName: 'Currency',
                            name: 'currency',
                            type: 'string',
                            default: '',
                            description: 'Currency code (e.g. USD)',
                            required: true,
                          },
                          {
                            displayName: 'Amount',
                            name: 'amount',
                            type: 'string',
                            default: '',
                            description: 'Price amount',
                            required: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    displayName: 'Unit Cost',
                    name: 'unitCost',
                    type: 'fixedCollection',
                    default: {},
                    options: [
                      {
                        name: 'cost',
                        displayName: 'Cost',
                        values: [
                          {
                            displayName: 'Currency',
                            name: 'currency',
                            type: 'string',
                            default: '',
                            description: 'Currency code (e.g. USD)',
                            required: true,
                          },
                          {
                            displayName: 'Amount',
                            name: 'amount',
                            type: 'string',
                            default: '',
                            description: 'Price amount',
                            required: true,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    displayName: 'Unit Provider Cost',
                    name: 'unitProviderCost',
                    type: 'fixedCollection',
                    default: {},
                    options: [
                      {
                        name: 'providerCost',
                        displayName: 'Provider Cost',
                        values: [
                          {
                            displayName: 'Currency',
                            name: 'currency',
                            type: 'string',
                            default: '',
                            description: 'Currency code (e.g. USD)',
                            required: true,
                          },
                          {
                            displayName: 'Amount',
                            name: 'amount',
                            type: 'string',
                            default: '',
                            description: 'Price amount',
                            required: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
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
