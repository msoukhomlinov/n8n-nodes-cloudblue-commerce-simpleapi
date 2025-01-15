import type { IResourceMetadata } from './ResourceRegistry';
import { ResourceRegistry } from './ResourceRegistry';
import { ResourceEventManager } from './ResourceEvents';
import type { ResourceValidator } from './ResourceValidator';
import type { IDataObject } from 'n8n-workflow';

export interface IResourceOptions {
  metadata: IResourceMetadata;
  validators?: ResourceValidator[];
}

export abstract class BaseResource {
  protected readonly registry: ResourceRegistry;
  protected readonly eventManager: ResourceEventManager;
  protected readonly resourceName: string;

  constructor(options: IResourceOptions) {
    this.registry = ResourceRegistry.getInstance();
    this.eventManager = ResourceEventManager.getInstance();
    this.resourceName = options.metadata.name;

    // Register this resource
    this.registry.register(this, options.metadata, options.validators);

    // Setup event handlers
    this.setupEventHandlers();
  }

  protected abstract setupEventHandlers(): void;

  protected async validateOperation(
    operation: 'create' | 'update' | 'delete',
    data: unknown,
  ): Promise<boolean> {
    const validators = this.registry.getValidators(this.resourceName);
    let isValid = true;

    for (const validator of validators) {
      if (!(await validator.validate({ resourceName: this.resourceName, operation, data }))) {
        isValid = false;
      }
    }

    return isValid;
  }

  protected async emitBeforeEvent<T>(
    operation: 'create' | 'update' | 'delete',
    data: T,
  ): Promise<void> {
    const eventType =
      operation === 'create'
        ? 'beforeCreate'
        : operation === 'update'
        ? 'beforeUpdate'
        : 'beforeDelete';
    await this.eventManager.emit({
      type: eventType,
      resourceName: this.resourceName,
      data,
    });
  }

  protected async emitAfterEvent<T>(
    operation: 'create' | 'update' | 'delete',
    data: T,
  ): Promise<void> {
    const eventType =
      operation === 'create'
        ? 'afterCreate'
        : operation === 'update'
        ? 'afterUpdate'
        : 'afterDelete';
    await this.eventManager.emit({
      type: eventType,
      resourceName: this.resourceName,
      data,
    });
  }

  protected async handleError(error: Error): Promise<void> {
    await this.eventManager.emitError(this.resourceName, error);
    throw error;
  }

  public async create(data: IDataObject): Promise<IDataObject> {
    try {
      await this.emitBeforeEvent('create', data);

      if (!(await this.validateOperation('create', data))) {
        throw new Error(`Validation failed for ${this.resourceName} creation`);
      }

      const result = await this.createImpl(data);
      await this.emitAfterEvent('create', result);
      return result;
    } catch (error) {
      await this.handleError(
        error instanceof Error ? error : new Error('Unknown error during create'),
      );
      throw error;
    }
  }

  public async update(id: string, data: IDataObject): Promise<IDataObject> {
    try {
      await this.emitBeforeEvent('update', { id, data });

      if (!(await this.validateOperation('update', data))) {
        throw new Error(`Validation failed for ${this.resourceName} update`);
      }

      const result = await this.updateImpl(id, data);
      await this.emitAfterEvent('update', result);
      return result;
    } catch (error) {
      await this.handleError(
        error instanceof Error ? error : new Error('Unknown error during update'),
      );
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.emitBeforeEvent('delete', { id });

      if (!(await this.validateOperation('delete', { id }))) {
        throw new Error(`Validation failed for ${this.resourceName} deletion`);
      }

      await this.deleteImpl(id);
      await this.emitAfterEvent('delete', { id });
    } catch (error) {
      await this.handleError(
        error instanceof Error ? error : new Error('Unknown error during delete'),
      );
      throw error;
    }
  }

  protected abstract createImpl(data: IDataObject): Promise<IDataObject>;
  protected abstract updateImpl(id: string, data: IDataObject): Promise<IDataObject>;
  protected abstract deleteImpl(id: string): Promise<void>;
}
