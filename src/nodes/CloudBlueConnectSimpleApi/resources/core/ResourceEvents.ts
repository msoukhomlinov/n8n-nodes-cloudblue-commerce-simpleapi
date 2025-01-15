import { EventEmitter } from 'node:events';

export type ResourceEventType =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeDelete'
  | 'afterDelete'
  | 'validation'
  | 'error';

export interface IResourceEvent<T = unknown> {
  type: ResourceEventType;
  resourceName: string;
  timestamp: number;
  data?: T;
  error?: Error;
}

export type IResourceEventHandler<T = unknown> = (event: IResourceEvent<T>) => Promise<void>;

export class ResourceEventManager {
  private static instance: ResourceEventManager;
  private eventEmitter: EventEmitter;
  private handlers: Map<string, Set<IResourceEventHandler>>;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.handlers = new Map();
    this.setupEventForwarding();
  }

  public static getInstance(): ResourceEventManager {
    if (!ResourceEventManager.instance) {
      ResourceEventManager.instance = new ResourceEventManager();
    }
    return ResourceEventManager.instance;
  }

  private setupEventForwarding(): void {
    this.eventEmitter.on('resource:event', async (event: IResourceEvent) => {
      const handlers = this.handlers.get(event.type) || new Set();
      const promises = Array.from(handlers).map((handler) => {
        try {
          return handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    });
  }

  public on<T>(type: ResourceEventType, handler: IResourceEventHandler<T>): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler as IResourceEventHandler);
  }

  public off<T>(type: ResourceEventType, handler: IResourceEventHandler<T>): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler as IResourceEventHandler);
    }
  }

  public async emit<T>(event: Omit<IResourceEvent<T>, 'timestamp'>): Promise<void> {
    const fullEvent: IResourceEvent<T> = {
      ...event,
      timestamp: Date.now(),
    };
    this.eventEmitter.emit('resource:event', fullEvent);
  }

  public async emitError(resourceName: string, error: Error): Promise<void> {
    await this.emit({
      type: 'error',
      resourceName,
      error,
    });
  }

  public getHandlersForType(type: ResourceEventType): Set<IResourceEventHandler> {
    return new Set(this.handlers.get(type));
  }

  public clearHandlers(): void {
    this.handlers.clear();
  }
}
