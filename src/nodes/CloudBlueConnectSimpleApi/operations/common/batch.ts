import type { IDataObject } from 'n8n-workflow';
import type { OperationFunction, IOperationResult } from '../core/OperationRegistry';
import { OperationRegistry } from '../core/OperationRegistry';

export interface IBatchOperationResult<T = unknown> extends IOperationResult {
  results?: Array<{
    success: boolean;
    data?: T;
    error?: Error;
  }>;
  summary?: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

export function createBatchOperation<T = IDataObject>(
  resourceName: string,
  operationType: 'create' | 'update' | 'delete',
  options: {
    batchSize?: number;
    continueOnError?: boolean;
    parallel?: boolean;
  } = {},
): OperationFunction {
  const registry = OperationRegistry.getInstance();
  const batchSize = options.batchSize ?? 10;
  const continueOnError = options.continueOnError ?? false;
  const parallel = options.parallel ?? false;

  return async (context): Promise<IBatchOperationResult<T>> => {
    const items = context.params.items as IDataObject[];
    if (!Array.isArray(items)) {
      return {
        success: false,
        error: new Error('Batch operation requires an array of items'),
      };
    }

    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    const results: Array<{
      success: boolean;
      data?: T;
      error?: Error;
    }> = [];

    const processBatch = async (batch: IDataObject[]) => {
      const batchResults = parallel
        ? await Promise.all(
            batch.map((item) =>
              registry
                .executeOperation(resourceName, operationType, item)
                .then((result) => ({
                  success: result.success,
                  data: result.data as T,
                  error: result.error,
                }))
                .catch((error) => ({
                  success: false,
                  error: error instanceof Error ? error : new Error('Unknown error'),
                })),
            ),
          )
        : await batch.reduce(async (promise, item) => {
            const acc = await promise;
            try {
              const result = await registry.executeOperation(resourceName, operationType, item);
              acc.push({
                success: result.success,
                data: result.data as T,
                error: result.error,
              });
            } catch (error) {
              acc.push({
                success: false,
                error: error instanceof Error ? error : new Error('Unknown error'),
              });
            }
            return acc;
          }, Promise.resolve([] as Array<{ success: boolean; data?: T; error?: Error }>));

      results.push(...batchResults);

      if (!continueOnError && batchResults.some((result) => !result.success)) {
        throw new Error('Batch operation failed and continueOnError is false');
      }
    };

    try {
      for (const batch of batches) {
        await processBatch(batch);
      }

      const summary = results.reduce(
        (acc, result) => ({
          total: acc.total + 1,
          succeeded: acc.succeeded + (result.success ? 1 : 0),
          failed: acc.failed + (result.success ? 0 : 1),
        }),
        { total: 0, succeeded: 0, failed: 0 },
      );

      return {
        success: summary.failed === 0,
        results,
        summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Batch operation failed'),
        results,
        summary: {
          total: results.length,
          succeeded: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      };
    }
  };
}
