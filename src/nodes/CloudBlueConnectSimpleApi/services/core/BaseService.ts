import type { IServiceConfig } from './ServiceRegistry';
import { ServiceRegistry } from './ServiceRegistry';
import { ServiceMonitor } from './ServiceMonitor';
import { ConfigurationManager } from './ConfigurationManager';

export interface IBaseServiceConfig extends IServiceConfig {
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export abstract class BaseService {
  protected readonly serviceName: string;
  protected readonly registry: ServiceRegistry;
  protected readonly monitor: ServiceMonitor;
  protected readonly configManager: ConfigurationManager;

  constructor(config: IBaseServiceConfig) {
    this.serviceName = config.name;
    this.registry = ServiceRegistry.getInstance();
    this.monitor = ServiceMonitor.getInstance();
    this.configManager = ConfigurationManager.getInstance();

    // Register service with registry
    this.registry.register(this, config);

    // Initialize configuration
    this.configManager.setConfiguration(config);
  }

  protected async executeWithMetrics<T>(
    operation: () => Promise<T>,
    operationName = 'unknown',
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      this.monitor.recordMetric(this.serviceName, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitor.recordMetric(this.serviceName, duration, true);
      throw error;
    }
  }

  protected getConfig<T>(): T {
    return this.configManager.getConfiguration<T>(this.serviceName);
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    customRetryAttempts?: number,
  ): Promise<T> {
    const config = this.getConfig<IBaseServiceConfig>();
    const maxAttempts = customRetryAttempts ?? config.retryAttempts ?? 3;
    const delay = config.retryDelay ?? 1000;

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.executeWithMetrics(operation);
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) break;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }

  protected async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    const config = this.getConfig<IBaseServiceConfig>();
    const timeout = config.timeout ?? 30000;

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });

    return Promise.race([this.executeWithMetrics(operation), timeoutPromise]);
  }

  public abstract initialize(): Promise<void>;

  public abstract healthCheck(): Promise<boolean>;

  protected async shutdown(): Promise<void> {
    // Implement any cleanup logic in derived classes
  }
}
