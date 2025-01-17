/**
 * @file Common Node Descriptions
 * @description Defines the base node configuration and common properties for the CloudBlue Commerce SimpleAPI.
 * Contains:
 * - Base node metadata (name, icon, version)
 * - Common node configuration (inputs, outputs)
 * - Resource selection options
 *
 * @module CloudBlueCommerceSimpleApi/descriptions/common
 */

import type { INodeTypeDescription } from 'n8n-workflow';

export const baseDescription: Partial<INodeTypeDescription> = {
  displayName: 'CloudBlue Commerce SimpleAPI',
  name: 'cloudBlueCommerceSimpleApi',
  icon: 'file:cloudblue.svg',
  group: ['transform'],
  version: 0.9,
  subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
  description: 'Interact with CloudBlue Commerce SimpleAPI',
  defaults: {
    name: 'CloudBlue Commerce SimpleAPI',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'cloudBlueCommerceSimpleApi',
      required: true,
    },
  ],
};

export const resourceSelection = {
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Customer',
      value: 'customer',
    },
    {
      name: 'Order',
      value: 'order',
    },
    {
      name: 'Plan',
      value: 'plan',
    },
    {
      name: 'Subscription',
      value: 'subscription',
    },
  ],
  default: 'customer',
};
