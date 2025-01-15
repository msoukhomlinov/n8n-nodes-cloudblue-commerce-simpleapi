I'll analyze the codebase structure to provide a detailed framework description for n8n node development. Let me gather the relevant information first.

Read file: src/nodes/Hudu/utils/requestUtils.ts

Read file: src/nodes/Hudu/utils/operations/getAll.ts

Read file: src/nodes/Hudu/resources/companies/companies.handler.ts


Based on the codebase analysis, I'll provide a detailed framework description for developing n8n nodes using this architecture pattern:

# n8n Node Development Framework

## 1. Core Architecture Components

### 1.1 Request Utilities (`requestUtils.ts`)
The foundation of API interactions is built on a robust request utilities layer that handles:
- Base request configuration and execution
- Authentication and credential management
- Response parsing and error handling
- Pagination handling
- Type-safe data conversion

Key components:
```typescript
interface IRequestOptions {
    method: HttpMethod;
    endpoint: string;
    body?: IDataObject;
    qs?: IDataObject;
    paginate?: boolean;
    contentType?: string;
}
```

### 1.2 Operations Layer
Located in `utils/operations/`, this layer provides standardized operation handlers for common API actions:
- `getAll.ts` - List/retrieve multiple resources
- `get.ts` - Retrieve single resource
- `create.ts` - Create new resource
- `update.ts` - Update existing resource
- `delete.ts` - Delete resource

Each operation handler implements consistent interfaces and error handling.

### 1.3 Resource Handlers
Located in `resources/{resource}/`, these handlers:
- Define resource-specific operations
- Map n8n parameters to API parameters
- Implement resource-specific logic
- Use standardized operation handlers

## 2. Implementation Flow

### 2.1 Request Flow
1. Resource handler receives operation request
2. Maps n8n parameters to API format
3. Calls appropriate operation handler
4. Operation handler uses request utilities
5. Request utilities execute API call
6. Response is parsed and returned

### 2.2 Code Organization
```
src/nodes/YourNode/
├── utils/
│   ├── requestUtils.ts         # Base request handling
│   ├── constants.ts           # API constants
│   ├── types.ts              # Shared types
│   └── operations/           # Standard operations
│       ├── getAll.ts
│       ├── get.ts
│       └── ...
├── resources/                # Resource implementations
│   ├── resource1/
│   │   ├── resource1.handler.ts
│   │   ├── resource1.types.ts
│   │   └── resource1.description.ts
│   └── resource2/
└── YourNode.node.ts         # Main node file
```

## 3. Development Guidelines

### 3.1 Request Utilities
- Implement base request handling with proper error management
- Handle authentication consistently
- Implement pagination handling
- Provide type safety between n8n and API formats

### 3.2 Operations
- Create standardized operation handlers for common actions
- Implement consistent interfaces
- Handle resource-specific parameters
- Support filtering and pagination where applicable

### 3.3 Resource Handlers
- One handler per API resource
- Use operation handlers for standard CRUD operations
- Implement resource-specific operations as needed
- Proper parameter mapping and validation

### 3.4 Type Safety
- Define clear interfaces for all operations
- Use TypeScript generics for flexible yet type-safe implementations
- Maintain separate type definitions for each resource

## 4. Best Practices

1. **Error Handling**
   - Implement consistent error handling at request level
   - Provide meaningful error messages
   - Handle API-specific error codes

2. **Parameter Handling**
   - Validate parameters before requests
   - Provide clear parameter descriptions
   - Support optional parameters appropriately

3. **Response Processing**
   - Consistent response format
   - Handle pagination results
   - Support filtering and sorting

4. **Code Organization**
   - Separate concerns (requests, operations, resources)
   - Maintain clear file structure
   - Use consistent naming conventions

5. **Documentation**
   - Document all interfaces and types
   - Provide usage examples
   - Maintain clear API documentation

This framework provides a solid foundation for developing n8n nodes with:
- Consistent architecture
- Reusable components
- Type safety
- Proper error handling
- Scalable resource handling

By following this pattern, developers can quickly implement new n8n nodes while maintaining code quality and consistency.
