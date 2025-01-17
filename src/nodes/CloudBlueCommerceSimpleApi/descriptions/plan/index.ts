/**
 * @file Plan Resource Description
 * @description Defines operations and fields for the Plan resource
 * Implements:
 * - Operation definitions
 * - Field properties and validation
 * - Display options and conditional logic
 *
 * @module CloudBlueCommerceSimpleApi/descriptions/plan
 */

import type { INodeProperties } from 'n8n-workflow';
import { PAGINATION } from '../../utils/constants';

export const planOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['plan'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a service plan by ID',
        action: 'Get a service plan',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many service plans',
        action: 'Get many service plans',
      },
    ],
    default: 'getMany',
  },
];

const basePlanFields: INodeProperties[] = [
  // Single Plan Operations (get)
  {
    displayName: 'Plan ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['plan'],
        operation: ['get'],
      },
    },
    description: 'The ID of the service plan',
  },

  // Get Many Operation Fields
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['plan'],
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
    description: 'Max number of results to return',
    displayOptions: {
      show: {
        resource: ['plan'],
        operation: ['getMany'],
        returnAll: [false],
      },
    },
  },
];

export const planFields: INodeProperties[] = [...planOperations, ...basePlanFields];
