# Resource Description Template Guide

This guide provides standardized templates for implementing resource descriptions in the CloudBlue Commerce SimpleAPI node.

## Basic Structure

```typescript
/**
 * @file {Resource} Resource Description
 * @description Defines operations and fields for the {resource} resource
 * Implements:
 * - Operation definitions
 * - Field properties and validation
 * - Display options and conditional logic
 *
 * @module CloudBlueCommerceSimpleApi/descriptions/{resource}
 */

import type { INodeProperties } from 'n8n-workflow';
import { PAGINATION } from '../../utils/constants';
import { {Resource}Status } from '../../resources/{resource}/{resource}.types';

// Operations must follow {resource}Operations naming
export const {resource}Operations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['{resource}'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a {resource} by ID',
        action: 'Get a {resource}',
      },
      {
        name: 'Get Many',
        value: 'getMany',
        description: 'Get many {resource}s',
        action: 'Get many {resource}s',
      },
      // Add other operations as needed
    ],
    default: 'getMany',
  },
];

// Base fields must follow base{Resource}Fields naming
const base{Resource}Fields: INodeProperties[] = [
  // Single Resource Operations (get, update, etc.)
  {
    displayName: '{Resource} ID',
    name: 'id',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['{resource}'],
        operation: ['get', 'update'],
      },
    },
    description: 'The ID of the {resource}',
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
        resource: ['{resource}'],
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
        resource: ['{resource}'],
        operation: ['getMany'],
      },
    },
  },

  // Filters Collection
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    default: {},
    placeholder: 'Add Filter',
    description: 'Filter the {resource}s',
    displayOptions: {
      show: {
        resource: ['{resource}'],
        operation: ['getMany'],
      },
    },
    options: [
      // Status Filter (if applicable)
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: Object.values({Resource}Status).map((status) => ({
          name: status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
          value: status,
        })),
        default: '',
        description: 'Filter by {resource} status',
      },
      // Date Range Filters
      {
        displayName: 'Created After',
        name: 'creationDateFrom',
        type: 'collection',
        default: {},
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
                default: '',
              },
            ],
          },
        ],
        description: 'Filter {resource}s created after this date',
      },
      // Add other filters as needed
    ],
  },
];

// Export must follow {resource}Fields naming
export const {resource}Fields: INodeProperties[] = [...{resource}Operations, ...base{Resource}Fields];

## Naming Conventions

1. File Location: `src/nodes/CloudBlueCommerceSimpleApi/descriptions/{resource}/index.ts`
2. Variable Names:
   - Operations: `{resource}Operations`
   - Base Fields: `base{Resource}Fields`
   - Exported Fields: `{resource}Fields`
3. Resource Name: Always use lowercase in resource identifiers (e.g., 'customer', 'order')
4. Parameter Names:
   - ID fields: `id` for single operations
   - Filters: Always use `filters` as the collection name
   - Limit: Always use `limit` for pagination
   - Return All: Always use `returnAll` for full result sets

## Common Field Types

1. **ID Fields**
```typescript
{
  displayName: '{Resource} ID',
  name: 'id',
  type: 'string',
  required: true,
  default: '',
}
```

2. **Status Fields**
```typescript
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: Object.values({Resource}Status).map((status) => ({
    name: status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    value: status,
  })),
}
```

3. **Date Fields**
```typescript
{
  displayName: 'Date',
  name: 'date',
  type: 'dateTime',
  default: '',
}
```

4. **Collection Fields**
```typescript
{
  displayName: 'Collection Name',
  name: 'collectionName',
  type: 'collection',
  default: {},
  options: [], // Array of field options
}
```

5. **Fixed Collection Fields**
```typescript
{
  displayName: 'Fixed Collection',
  name: 'fixedCollection',
  type: 'fixedCollection',
  default: {},
  options: [
    {
      name: 'values',
      displayName: 'Values',
      values: [], // Array of fixed fields
    },
  ],
}
```

## Display Options

Always include appropriate display options for field visibility:

```typescript
displayOptions: {
  show: {
    resource: ['{resource}'],
    operation: ['operationName'],
  },
}
```

## Best Practices

1. **Documentation**
   - Always include JSDoc header with file description
   - Document all fields with clear descriptions
   - Use consistent description formatting

2. **Imports**
   - Import types from n8n-workflow
   - Import constants from utils
   - Import enums from resource types

3. **Field Organization**
   - Group fields by operation type
   - Keep related fields together
   - Use consistent ordering (operations, single resource fields, list fields, filters)

4. **Validation**
   - Set appropriate default values
   - Include type validation where needed
   - Set required fields explicitly

5. **Naming**
   - Use clear, descriptive display names
   - Follow consistent parameter naming
   - Use standard field names for common operations

6. **Filters**
   - Always use 'filters' as the collection name
   - Group related filters logically
   - Include appropriate filter descriptions

7. **Pagination**
   - Only expose 'limit' and 'returnAll'
   - Use PAGINATION constants for defaults
   - Handle offset internally in resource handler

## Operation Implementation Standards

### 1. Standard Operation Structure
```typescript
export const resourceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['resourceName'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a resource by ID',
        action: 'Get a resource',
      },
      // ... other operations
    ],
    default: 'getMany',
  },
];
```

### 2. Standard Filter Structure
```typescript
{
  displayName: 'Filters',
  name: 'filters',  // Always use 'filters' as name
  type: 'collection',
  default: {},
  placeholder: 'Add Filter',
  description: 'Filter the resources',
  displayOptions: {
    show: {
      resource: ['resourceName'],
      operation: ['getMany'],
    },
  },
  options: [
    // Standard filter fields
  ],
}
```

### 3. Standard Date Filter Pattern
```typescript
{
  displayName: 'Date Range',
  name: 'dateFilter',
  type: 'collection',
  default: {},
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
          default: '',
        },
      ],
    },
  ],
}
```
