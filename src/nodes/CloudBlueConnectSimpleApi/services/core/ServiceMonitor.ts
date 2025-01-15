import type { IServiceMetrics } from './ServiceRegistry';
import { ServiceRegistry } from './ServiceRegistry';

export interface IPerformanceMetrics {
  responseTime: number;
  requestCount: number;
  errorCount: number;
  lastRequest: number;
}

export class ServiceMonitor {
  private static instance: ServiceMonitor;
  private registry: ServiceRegistry;
  private performanceMetrics: Map<string, IPerformanceMetrics>;
  private healthCheckInterval: NodeJS.Timeout | null;

  private constructor() {
    this.registry = ServiceRegistry.getInstance();
    this.performanceMetrics = new Map();
    this.healthCheckInterval = null;
    this.initializeMonitoring();
  }

  public static getInstance(): ServiceMonitor {
    if (!ServiceMonitor.instance) {
      ServiceMonitor.instance = new ServiceMonitor();
    }
    return ServiceMonitor.instance;
  }

  private initializeMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Run health checks every 30 seconds

    this.registry.onEvent('service:registered', (...args: unknown[]) => {
      const serviceName = args[0];
      if (typeof serviceName === 'string') {
        this.initializeMetrics(serviceName);
      }
    });
  }

  private initializeMetrics(serviceName: string): void {
    this.performanceMetrics.set(serviceName, {
      responseTime: 0,
      requestCount: 0,
      errorCount: 0,
      lastRequest: Date.now(),
    });
  }

  public recordMetric(serviceName: string, responseTime: number, isError = false): void {
    const metrics = this.performanceMetrics.get(serviceName);
    if (metrics) {
      metrics.responseTime =
        (metrics.responseTime * metrics.requestCount + responseTime) / (metrics.requestCount + 1);
      metrics.requestCount++;
      if (isError) metrics.errorCount++;
      metrics.lastRequest = Date.now();
      this.performanceMetrics.set(serviceName, metrics);
    }
  }

  private performHealthChecks(): void {
    const services = this.registry.getAllServices();
    services.forEach((service, name) => {
      const metrics = this.performanceMetrics.get(name);
      if (metrics) {
        const healthStatus: Partial<IServiceMetrics> = {
          lastHealthCheck: Date.now(),
          status: this.determineServiceHealth(metrics),
          errorCount: metrics.errorCount,
        };
        this.registry.updateMetrics(name, healthStatus);
      }
    });
  }

  private determineServiceHealth(metrics: IPerformanceMetrics): 'running' | 'error' {
    const THRESHOLD_ERROR_RATE = 0.1; // 10% error rate threshold
    const errorRate = metrics.requestCount > 0 ? metrics.errorCount / metrics.requestCount : 0;
    return errorRate < THRESHOLD_ERROR_RATE ? 'running' : 'error';
  }

  public getServiceMetrics(serviceName: string): IPerformanceMetrics | undefined {
    return this.performanceMetrics.get(serviceName);
  }

  public getAllMetrics(): Map<string, IPerformanceMetrics> {
    return new Map(this.performanceMetrics);
  }

  public stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}
