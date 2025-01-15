import type { IDataObject } from 'n8n-workflow';
import type { OperationFunction, IOperationResult, OperationType } from '../core/OperationRegistry';
import { OperationRegistry } from '../core/OperationRegistry';

export interface ICompositeOperationStep {
  resourceName: string;
  operationType: OperationType;
  params: IDataObject;
  condition?: (results: IDataObject) => boolean;
  transform?: (results: IDataObject) => IDataObject;
}

export interface ICompositeOperationResult extends IOperationResult {
  stepResults?: Array<{
    step: ICompositeOperationStep;
    result: IOperationResult;
  }>;
}

export function createCompositeOperation(
  steps: ICompositeOperationStep[],
  options: {
    stopOnError?: boolean;
    aggregateResults?: boolean;
  } = {},
): OperationFunction {
  const registry = OperationRegistry.getInstance();
  const stopOnError = options.stopOnError ?? true;
  const aggregateResults = options.aggregateResults ?? true;

  return async (context): Promise<ICompositeOperationResult> => {
    const stepResults: Array<{
      step: ICompositeOperationStep;
      result: IOperationResult;
    }> = [];
    const aggregatedData: IDataObject = {};

    for (const step of steps) {
      // Check condition if present
      if (step.condition && !step.condition(aggregatedData)) {
        continue;
      }

      // Transform params if needed
      const params = step.transform ? step.transform(aggregatedData) : step.params;

      try {
        const result = await registry.executeOperation(
          step.resourceName,
          step.operationType,
          params,
        );

        stepResults.push({ step, result });

        if (!result.success && stopOnError) {
          return {
            success: false,
            error: result.error,
            stepResults,
          };
        }

        if (aggregateResults && result.success && result.data) {
          Object.assign(aggregatedData, result.data);
        }
      } catch (error) {
        const failedResult = {
          success: false,
          error: error instanceof Error ? error : new Error('Step execution failed'),
        };
        stepResults.push({ step, result: failedResult });

        if (stopOnError) {
          return {
            success: false,
            error: failedResult.error,
            stepResults,
          };
        }
      }
    }

    const hasErrors = stepResults.some((step) => !step.result.success);
    return {
      success: !hasErrors,
      data: aggregateResults ? aggregatedData : undefined,
      stepResults,
      error: hasErrors ? new Error('One or more steps failed') : undefined,
    };
  };
}

export function createTransactionOperation(
  steps: ICompositeOperationStep[],
  rollbackSteps?: ICompositeOperationStep[],
): OperationFunction {
  const registry = OperationRegistry.getInstance();

  return async (context): Promise<ICompositeOperationResult> => {
    const stepResults: Array<{
      step: ICompositeOperationStep;
      result: IOperationResult;
    }> = [];
    const aggregatedData: IDataObject = {};

    try {
      // Execute main steps
      for (const step of steps) {
        const result = await registry.executeOperation(
          step.resourceName,
          step.operationType,
          step.params,
        );

        stepResults.push({ step, result });

        if (!result.success) {
          throw new Error('Transaction step failed');
        }

        if (result.data) {
          Object.assign(aggregatedData, result.data);
        }
      }

      return {
        success: true,
        data: aggregatedData,
        stepResults,
      };
    } catch (error) {
      // Execute rollback steps if provided
      if (rollbackSteps) {
        for (const step of rollbackSteps) {
          try {
            await registry.executeOperation(step.resourceName, step.operationType, step.params);
          } catch (rollbackError) {
            console.error('Rollback step failed:', rollbackError);
          }
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Transaction failed'),
        stepResults,
      };
    }
  };
}
