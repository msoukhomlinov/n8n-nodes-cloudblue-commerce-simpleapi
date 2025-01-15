import type { IOperationContext, IOperationResult } from './OperationRegistry';

export interface IOperationMetrics {
  count: number;
  totalTime: number;
  errors: number;
  lastExecuted: number;
  averageTime: number;
  errorRate: number;
}

export class OperationMetricsManager {
  private static instance: OperationMetricsManager;
  private metrics: Map<string, IOperationMetrics>;

  private constructor() {
    this.metrics = new Map();
  }

  public static getInstance(): OperationMetricsManager {
    if (!OperationMetricsManager.instance) {
      OperationMetricsManager.instance = new OperationMetricsManager();
    }
    return OperationMetricsManager.instance;
  }

  public recordOperation(
    context: IOperationContext,
    startTime: number,
    result: IOperationResult,
  ): void {
    const key = `${context.resourceName}:${context.operationType}`;
    const duration = Date.now() - startTime;
    const current = this.metrics.get(key) ?? {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastExecuted: 0,
      averageTime: 0,
      errorRate: 0,
    };

    const newMetrics = {
      count: current.count + 1,
      totalTime: current.totalTime + duration,
      errors: current.errors + (result.success ? 0 : 1),
      lastExecuted: Date.now(),
      averageTime: (current.totalTime + duration) / (current.count + 1),
      errorRate: (current.errors + (result.success ? 0 : 1)) / (current.count + 1),
    };

    this.metrics.set(key, newMetrics);
  }

  public getMetrics(resourceName?: string, operationType?: string): Map<string, IOperationMetrics> {
    if (!resourceName) {
      return new Map(this.metrics);
    }

    const filtered = new Map();
    for (const [key, metrics] of this.metrics) {
      if (key.startsWith(resourceName) && (!operationType || key.endsWith(operationType))) {
        filtered.set(key, metrics);
      }
    }
    return filtered;
  }

  public getMetricsForOperation(
    resourceName: string,
    operationType: string,
  ): IOperationMetrics | undefined {
    return this.metrics.get(`${resourceName}:${operationType}`);
  }

  public clearMetrics(resourceName?: string, operationType?: string): void {
    if (!resourceName) {
      this.metrics.clear();
      return;
    }

    for (const [key] of this.metrics) {
      if (key.startsWith(resourceName) && (!operationType || key.endsWith(operationType))) {
        this.metrics.delete(key);
      }
    }
  }

  public getAggregateMetrics(resourceName?: string): IOperationMetrics {
    const relevantMetrics = Array.from(this.getMetrics(resourceName).values());

    return relevantMetrics.reduce(
      (aggregate, current) => ({
        count: aggregate.count + current.count,
        totalTime: aggregate.totalTime + current.totalTime,
        errors: aggregate.errors + current.errors,
        lastExecuted: Math.max(aggregate.lastExecuted, current.lastExecuted),
        averageTime: 0, // Calculated below
        errorRate: 0, // Calculated below
      }),
      {
        count: 0,
        totalTime: 0,
        errors: 0,
        lastExecuted: 0,
        averageTime: 0,
        errorRate: 0,
      },
    );
  }
}
