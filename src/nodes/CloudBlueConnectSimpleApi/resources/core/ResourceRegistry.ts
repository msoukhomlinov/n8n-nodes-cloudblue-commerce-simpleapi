import { EventEmitter } from 'node:events';

export interface IResourceMetadata {
  name: string;
  version: string;
  dependencies?: string[];
  relationships?: {
    [key: string]: {
      type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
      target: string;
      inverse?: string;
    };
  };
}

export interface IRegisteredResource<T> {
  instance: T;
  metadata: IResourceMetadata;
  validators: ResourceValidator[];
}

export interface ResourceValidator {
  validate(data: unknown): Promise<boolean>;
  getErrors(): string[];
}

export class ResourceRegistry {
  private static instance: ResourceRegistry;
  private resources: Map<string, IRegisteredResource<unknown>>;
  private eventEmitter: EventEmitter;

  private constructor() {
    this.resources = new Map();
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): ResourceRegistry {
    if (!ResourceRegistry.instance) {
      ResourceRegistry.instance = new ResourceRegistry();
    }
    return ResourceRegistry.instance;
  }

  public register<T>(
    resource: T,
    metadata: IResourceMetadata,
    validators: ResourceValidator[] = [],
  ): void {
    if (this.resources.has(metadata.name)) {
      throw new Error(`Resource ${metadata.name} is already registered`);
    }

    this.validateDependencies(metadata);
    this.validateRelationships(metadata);

    this.resources.set(metadata.name, {
      instance: resource,
      metadata,
      validators,
    });

    this.eventEmitter.emit('resource:registered', metadata.name);
  }

  public getResource<T>(name: string): T {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource ${name} not found`);
    }
    return resource.instance as T;
  }

  public getMetadata(name: string): IResourceMetadata | undefined {
    return this.resources.get(name)?.metadata;
  }

  public getValidators(name: string): ResourceValidator[] {
    return this.resources.get(name)?.validators ?? [];
  }

  public onEvent(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  private validateDependencies(metadata: IResourceMetadata): void {
    if (metadata.dependencies) {
      for (const dep of metadata.dependencies) {
        if (!this.resources.has(dep)) {
          throw new Error(`Required dependency ${dep} not found for resource ${metadata.name}`);
        }
      }
    }
  }

  private validateRelationships(metadata: IResourceMetadata): void {
    if (metadata.relationships) {
      for (const [name, relationship] of Object.entries(metadata.relationships)) {
        if (!this.resources.has(relationship.target)) {
          throw new Error(
            `Target resource ${relationship.target} not found for relationship ${name} in resource ${metadata.name}`,
          );
        }

        if (relationship.inverse) {
          const targetMetadata = this.getMetadata(relationship.target);
          const inverseRelationship = targetMetadata?.relationships?.[relationship.inverse];
          if (!inverseRelationship) {
            throw new Error(
              `Inverse relationship ${relationship.inverse} not found in target resource ${relationship.target}`,
            );
          }
          if (inverseRelationship.target !== metadata.name) {
            throw new Error(
              `Inverse relationship ${relationship.inverse} in ${relationship.target} does not point back to ${metadata.name}`,
            );
          }
        }
      }
    }
  }

  public getRelatedResources(resourceName: string): Map<string, IRegisteredResource<unknown>> {
    const resource = this.resources.get(resourceName);
    if (!resource) {
      throw new Error(`Resource ${resourceName} not found`);
    }

    const related = new Map<string, IRegisteredResource<unknown>>();
    const relationships = resource.metadata.relationships ?? {};

    for (const relationship of Object.values(relationships)) {
      const targetResource = this.resources.get(relationship.target);
      if (targetResource) {
        related.set(relationship.target, targetResource);
      }
    }

    return related;
  }

  public getAllResources(): Map<string, IRegisteredResource<unknown>> {
    return new Map(this.resources);
  }
}
