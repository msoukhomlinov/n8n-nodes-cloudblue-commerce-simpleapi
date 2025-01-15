import { EventEmitter } from 'node:events';

export interface IServiceConfig {
  name: string;
  version: string;
  dependencies?: string[];
  config?: Record<string, unknown>;
}

export interface IServiceMetrics {
  startTime: number;
  lastHealthCheck: number;
  status: 'starting' | 'running' | 'error' | 'stopped';
  errorCount: number;
}

export interface IRegisteredService<T> {
  instance: T;
  config: IServiceConfig;
  metrics: IServiceMetrics;
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, IRegisteredService<unknown>>;
  private eventEmitter: EventEmitter;

  private constructor() {
    this.services = new Map();
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public register<T>(service: T, config: IServiceConfig): void {
    if (this.services.has(config.name)) {
      throw new Error(`Service ${config.name} is already registered`);
    }

    const metrics: IServiceMetrics = {
      startTime: Date.now(),
      lastHealthCheck: Date.now(),
      status: 'starting',
      errorCount: 0,
    };

    this.services.set(config.name, { instance: service, config, metrics });
    this.validateDependencies(config);
    this.eventEmitter.emit('service:registered', config.name);
  }

  public getService<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service.instance as T;
  }

  public updateMetrics(name: string, metrics: Partial<IServiceMetrics>): void {
    const service = this.services.get(name);
    if (service) {
      service.metrics = { ...service.metrics, ...metrics };
      this.eventEmitter.emit('service:metrics:updated', name, service.metrics);
    }
  }

  public onEvent(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  private validateDependencies(config: IServiceConfig): void {
    if (config.dependencies) {
      for (const dep of config.dependencies) {
        if (!this.services.has(dep)) {
          throw new Error(`Required dependency ${dep} not found for service ${config.name}`);
        }
      }
    }
  }

  public getServiceHealth(name: string): IServiceMetrics | undefined {
    return this.services.get(name)?.metrics;
  }

  public getAllServices(): Map<string, IRegisteredService<unknown>> {
    return new Map(this.services);
  }
}
