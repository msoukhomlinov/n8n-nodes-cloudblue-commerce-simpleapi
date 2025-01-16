/**
 * @file Resource Registry for CloudBlue Connect Simple API Node
 * @description Centralizes the management of all resource handlers in the node.
 * Implements a singleton pattern to ensure consistent resource access across the node.
 * This registry is responsible for:
 * - Maintaining a type-safe mapping of resource types to their handlers
 * - Providing a unified interface for accessing resource handlers
 * - Managing resource handler lifecycle and initialization
 *
 * @module CloudBlueConnectSimpleApi/resources/registry
 */

import type { IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import type { CloudBlueApiService } from '../services/CloudBlueApiService';
import { SubscriptionHandler } from './subscription/subscription.handler';
import { CustomerHandler } from './customer/customer.handler';

export type ResourceType = 'subscription' | 'customer';
type ResourceFunctions = IExecuteFunctions | ILoadOptionsFunctions;

export interface IResourceHandler {
  execute(executeFunctions: IExecuteFunctions, operation: string, index: number): Promise<unknown>;
  loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]>;
}

export class ResourceRegistry {
  private static instance: ResourceRegistry;
  private resources: Record<ResourceType, IResourceHandler>;

  private constructor(apiService: CloudBlueApiService) {
    this.resources = {
      subscription: SubscriptionHandler.getInstance(apiService),
      customer: CustomerHandler.getInstance(apiService),
    };
  }

  public static getInstance(apiService: CloudBlueApiService): ResourceRegistry {
    if (!ResourceRegistry.instance) {
      ResourceRegistry.instance = new ResourceRegistry(apiService);
    }
    return ResourceRegistry.instance;
  }

  public getResource(resourceType: ResourceType): IResourceHandler | undefined {
    return this.resources[resourceType];
  }

  public hasResource(resourceType: ResourceType): boolean {
    return resourceType in this.resources;
  }
}
