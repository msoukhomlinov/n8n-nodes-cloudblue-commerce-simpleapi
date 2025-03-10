import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { baseDescription, resourceSelection } from './descriptions/common';
import { subscriptionOperations, subscriptionFields } from './descriptions/subscription';
import { initializeApiService } from './utils/credentials';
import type { ResourceType } from './resources/registry';
import { ResourceRegistry } from './resources/registry';
import { customerOperations, customerFields } from './descriptions/customer';
import { orderOperations, orderFields } from './descriptions/order';
import { planOperations, planFields } from './descriptions/plan';

export class CloudBlueCommerceSimpleApi implements INodeType {
  description: INodeTypeDescription = {
    ...baseDescription,
    properties: [
      resourceSelection,
      ...customerOperations,
      ...customerFields,
      ...subscriptionOperations,
      ...subscriptionFields,
      ...orderOperations,
      ...orderFields,
      ...planOperations,
      ...planFields,
    ] as unknown as INodeProperties[],
  } as INodeTypeDescription;

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    let returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as ResourceType;
    const operation = this.getNodeParameter('operation', 0) as string;

    const apiService = await initializeApiService(this);
    const registry = ResourceRegistry.getInstance(apiService);

    if (!registry.hasResource(resource)) {
      throw new NodeOperationError(
        this.getNode(),
        `Resource ${resource} not found or not yet migrated`,
      );
    }

    // We can safely assert non-null here since we checked hasResource
    const resourceInstance = registry.getResource(resource);
    if (!resourceInstance) {
      throw new NodeOperationError(
        this.getNode(),
        'Unexpected error: Resource exists but instance not found',
      );
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const response = await resourceInstance.execute(this, operation, i);

        // Handle array response for getMany
        if (operation === 'getMany' && Array.isArray(response)) {
          returnData = returnData.concat(
            response.map((item) => ({
              json: item as IDataObject,
            })),
          );
        } else {
          returnData.push({
            json: response as IDataObject,
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
          });
          continue;
        }
        throw new NodeOperationError(
          this.getNode(),
          error instanceof Error ? error.message : 'Unknown error occurred',
          {
            itemIndex: i,
            description: JSON.stringify({
              resource,
              operation,
              error: error instanceof Error ? error.stack : undefined,
            }),
          },
        );
      }
    }

    return [returnData];
  }

  async loadOptions(this: ILoadOptionsFunctions) {
    const resource = this.getNodeParameter('resource') as ResourceType;
    const propertyName = this.getNodeParameter('loadOptionsMethod') as string;
    const currentNodeParameters = this.getCurrentNodeParameters() as Record<string, unknown>;

    const apiService = await initializeApiService(this);
    const registry = ResourceRegistry.getInstance(apiService);

    const resourceInstance = registry.getResource(resource);
    if (!resourceInstance) {
      return [];
    }

    return resourceInstance.loadOptions(this, propertyName, currentNodeParameters);
  }
}
