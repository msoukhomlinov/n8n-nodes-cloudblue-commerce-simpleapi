/**
 * @file Common Node Descriptions
 * @description Defines the base node configuration and common properties for the CloudBlue Connect Simple API.
 * Contains:
 * - Base node metadata (name, icon, version)
 * - Common node configuration (inputs, outputs)
 * - Resource selection options
 *
 * @module CloudBlueConnectSimpleApi/descriptions/common
 */

import type { INodeTypeDescription } from 'n8n-workflow';

export const baseDescription: Partial<INodeTypeDescription> = {
  displayName: 'CloudBlue Connect Simple API',
  name: 'cloudBlueConnectSimpleApi',
  icon: 'file:cloudblue.svg',
  group: ['transform'],
  version: 1,
  subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
  description: 'Interact with CloudBlue Connect Simple API',
  defaults: {
    name: 'CloudBlue Connect Simple API',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'cloudBlueConnectSimpleApi',
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
      name: 'Subscription',
      value: 'subscription',
    },
  ],
  default: 'customer',
};
