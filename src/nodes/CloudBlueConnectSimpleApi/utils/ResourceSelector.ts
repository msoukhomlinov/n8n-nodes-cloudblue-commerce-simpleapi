import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { CloudBlueApiService } from '../services/CloudBlueApiService';
import { PaginationService } from '../services/PaginationService';
import { QueryParameterService } from '../services/QueryParameterService';

export class ResourceSelector {
  private apiService!: CloudBlueApiService;
  private readonly paginationService: PaginationService;
  private readonly queryService: QueryParameterService;

  constructor() {
    this.paginationService = new PaginationService();
    this.queryService = new QueryParameterService();
  }

  private async initializeApiService(loadOptionsFunctions: ILoadOptionsFunctions): Promise<void> {
    const credentials = await loadOptionsFunctions.getCredentials('cloudBlueConnectSimpleApi');
    this.apiService = CloudBlueApiService.getInstance(
      credentials.apiUrl as string,
      credentials.authUrl as string,
      credentials.username as string,
      credentials.password as string,
      credentials.clientId as string,
      credentials.clientSecret as string,
      credentials.subscriptionKey as string,
    );
  }

  async loadHierarchicalOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
    parentFields: string[] = [],
  ): Promise<INodePropertyOptions[]> {
    await this.initializeApiService(loadOptionsFunctions);

    // Validate parent dependencies
    const parentValues: Record<string, string> = {};
    for (const field of parentFields) {
      const value = currentParameters[field] as string;
      if (!value) {
        return [];
      }
      parentValues[field] = value;
    }

    try {
      // Build query parameters using QueryParameterService
      const additionalParams = this.queryService.buildQueryParameters(loadOptionsFunctions, 0, [
        { name: 'status', type: 'string', default: 'active' },
        ...this.getParameterDefinitionsForProperty(propertyName, parentValues),
      ]);

      // Get paginated results with filters
      const results = await this.paginationService.getPaginatedResults<{
        id: string;
        name: string;
      }>(
        this.apiService,
        loadOptionsFunctions,
        this.getEndpointForProperty(propertyName, parentValues),
        {
          returnAll: false,
          limit: 100,
          additionalParams,
        },
      );

      // Format results as options
      return results.map((item) => ({
        name: item.name,
        value: item.id,
        description: `ID: ${item.id}`,
      }));
    } catch (error) {
      console.error('Failed to load options:', error);
      return [];
    }
  }

  private getEndpointForProperty(
    propertyName: string,
    parentValues: Record<string, string>,
  ): string {
    switch (propertyName) {
      case 'subscription_id':
        return `/marketplaces/${parentValues.marketplace_id}/subscriptions`;
      default:
        return '';
    }
  }

  private getParameterDefinitionsForProperty(
    propertyName: string,
    parentValues: Record<string, string>,
  ): Array<{ name: string; type: string; default?: unknown }> {
    const definitions = [];

    switch (propertyName) {
      case 'product_id':
        definitions.push({
          name: 'marketplace_id',
          type: 'string',
          default: parentValues.marketplace_id,
        });
        break;
      case 'subscription_id':
        definitions.push(
          { name: 'marketplace_id', type: 'string', default: parentValues.marketplace_id },
          { name: 'product_id', type: 'string', default: parentValues.product_id },
        );
        break;
    }

    return definitions;
  }
}
