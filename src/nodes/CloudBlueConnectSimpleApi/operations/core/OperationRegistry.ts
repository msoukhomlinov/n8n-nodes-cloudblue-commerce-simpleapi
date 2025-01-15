import type { IDataObject } from 'n8n-workflow';

export type OperationType = 'create' | 'get' | 'update' | 'delete' | 'getMany';

export interface IOperationContext {
  resourceName: string;
  operationType: OperationType;
  params: IDataObject;
  metadata?: Record<string, unknown>;
}

export interface IOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export type OperationFunction = (context: IOperationContext) => Promise<IOperationResult>;
export type MiddlewareFunction = (
  context: IOperationContext,
  next: OperationFunction,
) => Promise<IOperationResult>;

export interface IRegisteredOperation {
  type: OperationType;
  handler: OperationFunction;
  middleware: MiddlewareFunction[];
  metadata?: Record<string, unknown>;
}

export class OperationRegistry {
  private static instance: OperationRegistry;
  private operations: Map<string, Map<OperationType, IRegisteredOperation>>;
  private globalMiddleware: MiddlewareFunction[];

  private constructor() {
    this.operations = new Map();
    this.globalMiddleware = [];
  }

  public static getInstance(): OperationRegistry {
    if (!OperationRegistry.instance) {
      OperationRegistry.instance = new OperationRegistry();
    }
    return OperationRegistry.instance;
  }

  public registerOperation(
    resourceName: string,
    type: OperationType,
    handler: OperationFunction,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.operations.has(resourceName)) {
      this.operations.set(resourceName, new Map());
    }

    const resourceOps = this.operations.get(resourceName);
    if (!resourceOps) {
      throw new Error(`Failed to get resource operations for ${resourceName}`);
    }
    resourceOps.set(type, {
      type,
      handler,
      middleware: [],
      metadata,
    });
  }

  public addMiddleware(
    middleware: MiddlewareFunction,
    resourceName?: string,
    operationType?: OperationType,
  ): void {
    if (!resourceName) {
      // Global middleware
      this.globalMiddleware.push(middleware);
      return;
    }

    const resourceOps = this.operations.get(resourceName);
    if (!resourceOps) {
      throw new Error(`Resource ${resourceName} not found`);
    }

    if (operationType) {
      // Operation-specific middleware
      const operation = resourceOps.get(operationType);
      if (!operation) {
        throw new Error(`Operation ${operationType} not found for resource ${resourceName}`);
      }
      operation.middleware.push(middleware);
    } else {
      // Resource-level middleware
      for (const op of resourceOps.values()) {
        op.middleware.push(middleware);
      }
    }
  }

  public async executeOperation(
    resourceName: string,
    type: OperationType,
    params: IDataObject,
  ): Promise<IOperationResult> {
    const resourceOps = this.operations.get(resourceName);
    if (!resourceOps) {
      throw new Error(`Resource ${resourceName} not found`);
    }

    const operation = resourceOps.get(type);
    if (!operation) {
      throw new Error(`Operation ${type} not found for resource ${resourceName}`);
    }

    const context: IOperationContext = {
      resourceName,
      operationType: type,
      params,
      metadata: operation.metadata,
    };

    // Combine middleware chain: global -> resource -> operation-specific
    const middlewareChain = [...this.globalMiddleware, ...operation.middleware];

    // Build the middleware chain
    const executeChain = middlewareChain.reduceRight(
      (next: OperationFunction, middleware: MiddlewareFunction) => {
        return (ctx: IOperationContext) => middleware(ctx, next);
      },
      operation.handler,
    );

    try {
      return await executeChain(context);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Unknown error during operation execution'),
      };
    }
  }

  public getOperation(resourceName: string, type: OperationType): IRegisteredOperation | undefined {
    return this.operations.get(resourceName)?.get(type);
  }

  public hasOperation(resourceName: string, type: OperationType): boolean {
    return !!this.getOperation(resourceName, type);
  }

  public clearMiddleware(resourceName?: string, operationType?: OperationType): void {
    if (!resourceName) {
      this.globalMiddleware = [];
      return;
    }

    const resourceOps = this.operations.get(resourceName);
    if (!resourceOps) return;

    if (operationType) {
      const operation = resourceOps.get(operationType);
      if (operation) {
        operation.middleware = [];
      }
    } else {
      // Resource-level middleware
      for (const op of resourceOps.values()) {
        op.middleware = [];
      }
    }
  }
}
