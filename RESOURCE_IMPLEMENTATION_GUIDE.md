# CloudBlue Connect SimpleAPI Resource Implementation Guide

This guide outlines the framework for implementing new resources in the CloudBlue Connect SimpleAPI node, based on the subscription resource implementation pattern.

## Resource Implementation Structure

### 1. Directory Structure
```
src/
├── credentials/
│   └── CloudBlueConnectSimpleApi.credentials.ts # Credentials definition
└── nodes/CloudBlueConnectSimpleApi/
    ├── CloudBlueConnectSimpleApi.node.ts # Main node implementation
    ├── resources/
    │   ├── {resource}/
    │   │   ├── {resource}.handler.ts    # Resource operation handler
    │   │   ├── {resource}.types.ts      # Type definitions
    │   │   └── {resource}.validator.ts  # Input validation
    │   └── registry.ts                  # Central resource registry
    ├── descriptions/
    │   ├── common.ts                    # Shared node descriptions
    │   └── {resource}/
    │       └── index.ts                 # Operation & field definitions
    ├── services/
    │   └── CloudBlueApiService.ts       # API service handling
    ├── utils/
    │   ├── constants.ts                 # Shared constants
    │   ├── credentials.ts               # Credential handling
    │   ├── dateConverter.ts             # Date utilities
    │   ├── debug.ts                     # Debug logging
    │   ├── errorHandler.ts              # Error handling
    │   └── pagination.ts                # Pagination utilities
    └── interfaces/
        ├── api.ts                       # Common API interfaces
        └── filters.ts                   # Filter type definitions
```

### 2. Core Components

#### 2.1 Main Node (`CloudBlueConnectSimpleApi.node.ts`)
- Entry point for the n8n node
- Defines node metadata and configuration
- Handles resource routing and execution
- Manages credential validation
- Example structure:
  ```typescript
  export class CloudBlueConnectSimpleApi implements INodeType {
    description: INodeTypeDescription;

    // Node configuration and metadata
    constructor() {
      this.description = {
        displayName: 'CloudBlue Connect SimpleAPI',
        name: 'cloudBlueConnectSimpleApi',
        icon: 'file:cloudblue.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Consume CloudBlue Connect SimpleAPI',
        defaults: {
          name: 'CloudBlue Connect SimpleAPI',
        },
        credentials: [
          {
            name: 'cloudBlueConnectSimpleApi',
            required: true,
          },
        ],
        // ... other configuration
      };
    }

    // Main execution method
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
  }
  ```

#### 2.2 Credentials (`CloudBlueConnectSimpleApi.credentials.ts`)
- Defines credential fields and validation
- Implements credential testing
- Example structure:
  ```typescript
  export class CloudBlueConnectSimpleApiCredentials implements ICredentialType {
    name = 'cloudBlueConnectSimpleApi';
    displayName = 'CloudBlue Connect SimpleAPI';
    documentationUrl = 'cloudBlueConnectSimpleApi';

    properties: INodeProperties[] = [
      {
        displayName: 'API Base URL',
        name: 'apiBaseUrl',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
      },
      // ... other credential fields
    ];

    // Optional credential test
    async authenticate(
      credentials: ICredentialDataDecryptedObject,
      requestOptions: IHttpRequestOptions,
    ): Promise<IHttpRequestOptions>;
  }
  ```

#### 2.1 Resource Handler (`{resource}.handler.ts`)
- Implements resource-specific operations (CRUD)
- Uses singleton pattern for consistent state
- Handles API service interactions
- Manages response transformation
- Example from subscription:
  ```typescript
  export class ResourceHandler {
    private static instance: ResourceHandler;
    private readonly apiService: CloudBlueApiService;

    public static getInstance(apiService: CloudBlueApiService): ResourceHandler;
    public async execute(executeFunctions: IExecuteFunctions, operation: string, i: number);
    public async loadOptions(loadOptionsFunctions: ILoadOptionsFunctions, propertyName: string);
  }
  ```

#### 2.2 Type Definitions (`{resource}.types.ts`)
- Defines resource-specific interfaces and types
- Includes request/response types
- Maps to OpenAPI specification types
- Example structure:
  ```typescript
  export interface IResource extends IDataObject {
    // Base properties
  }

  export interface IResourceDetailed extends IResource {
    // Additional properties for detailed view
  }

  export interface IResourceUpdate {
    // Update operation properties
  }
  ```

#### 2.3 Validation (`{resource}.validator.ts`)
- Implements input validation for operations
- Type checking and data structure validation
- Status and enum value validation
- Debug logging for validation failures

#### 2.4 Resource Description (`descriptions/{resource}/index.ts`)
- Defines available operations
- Specifies field properties and validation rules
- Handles display options and conditional rendering
- Maps to OpenAPI specification operations

## OpenAPI Specification Integration

Reference the SimpleAPI specification (`SimpleAPI (1.15).yaml`) for:
1. Endpoint paths and methods
2. Request/response schemas
3. Parameter definitions
4. Authentication requirements

Example mapping from OpenAPI to implementation:
```yaml
# OpenAPI Spec
/subscriptions:
  get:
    parameters:
      - name: status
        schema:
          type: string
          enum: [pending, active, hold, terminated, removed]

# Implementation
export enum ResourceStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  // ...
}
```

## Resource Registration

Add new resources to the registry (`registry.ts`):
```typescript
export type ResourceType = 'subscription' | 'newResource';

export class ResourceRegistry {
  private resources: Record<ResourceType, IResourceHandler> = {
    subscription: SubscriptionHandler.getInstance(apiService),
    newResource: NewResourceHandler.getInstance(apiService),
  };
}
```

## Implementation Steps

1. **OpenAPI Analysis**
   - Review the resource endpoints in `SimpleAPI (1.15).yaml`
   - Identify supported operations (GET, POST, PATCH, etc.)
   - Document required parameters and their types
   - Map response schemas to TypeScript interfaces
   - Note any resource-specific behaviors or constraints

2. **Type Definitions (`{resource}.types.ts`)**
   - Add JSDoc file header describing types and their purpose
   - Create enums for resource-specific constants (status, types)
   - Define base interface extending `IDataObject`
   - Define detailed interface for single-item responses
   - Create request/response interfaces for each operation
   - Map all OpenAPI schemas to TypeScript types
   - Define update operation interfaces

3. **Resource Description (`descriptions/{resource}/index.ts`)**
   - Add JSDoc file header describing the resource operations and fields
   - Define supported operations based on OpenAPI spec
   - Create field definitions for each operation
   - Implement display options and conditional logic
   - Add validation rules and field dependencies
   - Define default values and field types
   - Map to OpenAPI parameter definitions

4. **Resource Handler (`{resource}.handler.ts`)**
   - Add JSDoc file header describing handler responsibilities
   - Create singleton handler class with API service
   - Implement execute method for each operation
   - Add response transformation logic
   - Implement pagination for list operations
   - Add error handling and debug logging
   - Map API responses to n8n format

5. **Validation (`{resource}.validator.ts`)**
   - Add JSDoc file header describing validation functions
   - Create validation functions for each operation
   - Implement type checking for inputs
   - Add enum value validation
   - Validate required fields
   - Add debug logging for validation failures
   - Create helper validation functions

6. **Resource Registration**
   - Add resource type to `ResourceType` in registry
   - Register handler in `ResourceRegistry`
   - Update node description in main node file
   - Add resource to available choices

Each file should include a JSDoc header following this pattern:
```typescript
/**
 * @file Resource Name and File Purpose
 * @description Detailed description of what this file handles.
 * Implements:
 * - Key functionality 1
 * - Key functionality 2
 * - etc.
 *
 * @module CloudBlueConnectSimpleApi/path/to/file
 */
```

## Best Practices

1. **Type Safety**
   - Use strict TypeScript types
   - Implement comprehensive interfaces
   - Validate all inputs

2. **Error Handling**
   - Implement proper error catching
   - Use debug logging
   - Return meaningful error messages

3. **Code Organization**
   - Follow established directory structure
   - Use consistent naming conventions
   - Maintain separation of concerns

4. **Documentation**
   - Add JSDoc comments
   - Document public interfaces
   - Include usage examples

5. **Testing**
   - Implement unit tests
   - Add integration tests
   - Test error scenarios

## Shared Utilities

When implementing a new resource, the following utilities are available to handle common functionality:

1. **API Service (`services/CloudBlueApiService.ts`)**
   - Singleton service for API communication
   - Handles authentication and token management
   - Provides methods for HTTP operations (get, post, patch)
   - Manages request headers and API key
   - Implements response error handling

2. **Credentials (`utils/credentials.ts`)**
   - Initializes API service with credentials
   - Validates credential configuration
   - Manages API service lifecycle

3. **Pagination (`utils/pagination.ts`)**
   - Implements `getMany` utility for list operations
   - Handles offset/limit pagination
   - Manages response data transformation
   - Supports pagination parameters from OpenAPI spec

4. **Error Handling (`utils/errorHandler.ts`)**
   - Transforms API errors to n8n format
   - Provides consistent error messages
   - Handles API-specific error codes
   - Maps error responses to user-friendly messages

5. **Date Handling (`utils/dateConverter.ts`)**
   - Converts between date formats
   - Handles relative date calculations
   - Supports date filtering in queries
   - Implements date validation

6. **Debug Logging (`utils/debug.ts`)**
   - Structured logging for troubleshooting
   - Operation and data flow tracking
   - Error state logging
   - Development debugging support

7. **Constants (`utils/constants.ts`)**
   - Shared configuration values
   - Pagination defaults
   - Date presets
   - Common type definitions

Example usage in a resource handler:
```typescript
export class ResourceHandler {
  private readonly apiService: CloudBlueApiService;

  async execute(executeFunctions: IExecuteFunctions, operation: string, i: number) {
    // Use pagination utility for list operations
    if (operation === 'getMany') {
      return await getMany<IResource>(
        executeFunctions,
        this.apiService,
        '/resource-endpoint',
        i,
        params,
      );
    }

    // Use date conversion for filtering
    if (filters.dateFrom) {
      params.dateFrom = formatDateToYYYYMMDD(
        convertRelativeDate(dateFrom.presetDate.preset),
      );
    }

    // Use debug logging
    debugLog('RESOURCE_EXEC', `Executing ${operation}`, { params });
  }
}
```

## Example Usage

See the subscription implementation as a reference:
- `src/nodes/CloudBlueConnectSimpleApi/resources/subscription/`
- `src/nodes/CloudBlueConnectSimpleApi/descriptions/subscription/`

Follow this pattern when implementing new resources to maintain consistency and reliability across the codebase.
