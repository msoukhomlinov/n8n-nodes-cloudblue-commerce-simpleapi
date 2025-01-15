import type { IDataObject } from 'n8n-workflow';
import type { OperationFunction } from '../core/OperationRegistry';
import { OperationRegistry } from '../core/OperationRegistry';
import { OperationMiddleware } from '../core/OperationMiddleware';

export interface ICrudOperations {
  create?: OperationFunction;
  get?: OperationFunction;
  update?: OperationFunction;
  delete?: OperationFunction;
  getMany?: OperationFunction;
}

export function registerCrudOperations(
  resourceName: string,
  operations: ICrudOperations,
  options: {
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    enableCaching?: boolean;
    cacheTtl?: number;
  } = {},
): void {
  const registry = OperationRegistry.getInstance();

  // Add common middleware for all operations
  const commonMiddleware = [OperationMiddleware.logging(), OperationMiddleware.metrics()];

  if (options.timeout) {
    commonMiddleware.push(OperationMiddleware.timeout(options.timeout));
  }

  if (options.retryAttempts) {
    commonMiddleware.push(
      OperationMiddleware.retry(options.retryAttempts, options.retryDelay ?? 1000),
    );
  }

  // Register create operation
  if (operations.create) {
    registry.registerOperation(resourceName, 'create', operations.create);
    for (const middleware of commonMiddleware) {
      registry.addMiddleware(middleware, resourceName, 'create');
    }
  }

  // Register read operation
  if (operations.get) {
    registry.registerOperation(resourceName, 'get', operations.get);
    const readMiddleware = [...commonMiddleware];
    if (options.enableCaching) {
      readMiddleware.push(OperationMiddleware.caching(options.cacheTtl ?? 60000));
    }
    for (const middleware of readMiddleware) {
      registry.addMiddleware(middleware, resourceName, 'get');
    }
  }

  // Register update operation
  if (operations.update) {
    registry.registerOperation(resourceName, 'update', operations.update);
    for (const middleware of commonMiddleware) {
      registry.addMiddleware(middleware, resourceName, 'update');
    }
  }

  // Register delete operation
  if (operations.delete) {
    registry.registerOperation(resourceName, 'delete', operations.delete);
    for (const middleware of commonMiddleware) {
      registry.addMiddleware(middleware, resourceName, 'delete');
    }
  }

  // Register getMany operation
  if (operations.getMany) {
    registry.registerOperation(resourceName, 'getMany', operations.getMany);
    const getManyMiddleware = [...commonMiddleware];
    if (options.enableCaching) {
      getManyMiddleware.push(OperationMiddleware.caching(options.cacheTtl ?? 60000));
    }
    for (const middleware of getManyMiddleware) {
      registry.addMiddleware(middleware, resourceName, 'getMany');
    }
  }
}

export function createDefaultCrudOperations<T extends IDataObject>(
  resourceName: string,
  implementation: {
    create?: (data: IDataObject) => Promise<T>;
    get?: (id: string) => Promise<T>;
    update?: (id: string, data: IDataObject) => Promise<T>;
    delete?: (id: string) => Promise<void>;
    getMany?: (params: IDataObject) => Promise<T[]>;
  },
): ICrudOperations {
  const operations: ICrudOperations = {};

  if (implementation.create) {
    const create = implementation.create;
    operations.create = async (context) => {
      try {
        const result = await create(context.params);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Create operation failed'),
        };
      }
    };
  }

  if (implementation.get) {
    const get = implementation.get;
    operations.get = async (context) => {
      try {
        const result = await get(context.params.id as string);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Read operation failed'),
        };
      }
    };
  }

  if (implementation.update) {
    const update = implementation.update;
    operations.update = async (context) => {
      try {
        const result = await update(
          context.params.id as string,
          context.params.data as IDataObject,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Update operation failed'),
        };
      }
    };
  }

  if (implementation.delete) {
    const del = implementation.delete;
    operations.delete = async (context) => {
      try {
        await del(context.params.id as string);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Delete operation failed'),
        };
      }
    };
  }

  if (implementation.getMany) {
    const getMany = implementation.getMany;
    operations.getMany = async (context) => {
      try {
        const result = await getMany(context.params);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error('Get many operation failed'),
        };
      }
    };
  }

  return operations;
}
