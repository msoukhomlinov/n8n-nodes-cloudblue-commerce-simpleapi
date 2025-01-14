import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { CloudBlueApiService } from '../services/CloudBlueApiService';
import { ResponseProcessingService } from '../services/ResponseProcessingService';
import { PaginationService } from '../services/PaginationService';
import { QueryParameterService } from '../services/QueryParameterService';
import type { IPaginatedResponse } from '../interfaces';

export class ResourceSelector {
  private readonly apiService: CloudBlueApiService;
  private readonly responseProcessor: ResponseProcessingService;
  private readonly paginationService: PaginationService;
  private readonly queryService: QueryParameterService;

  constructor() {
    this.apiService = CloudBlueApiService.getInstance();
    this.responseProcessor = new ResponseProcessingService();
    this.paginationService = new PaginationService();
    this.queryService = new QueryParameterService();
  }

  async loadHierarchicalOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentParameters: Record<string, unknown>,
    parentFields: string[] = [],
  ): Promise<INodePropertyOptions[]> {
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
          additionalParams: {
            ...this.getFiltersForProperty(propertyName, parentValues),
            status: 'active',
          },
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
      case 'marketplace_id':
        return '/marketplaces';
      case 'product_id':
        return `/marketplaces/${parentValues.marketplace_id}/products`;
      case 'subscription_id':
        return `/marketplaces/${parentValues.marketplace_id}/subscriptions`;
      default:
        return '';
    }
  }

  private getFiltersForProperty(
    propertyName: string,
    parentValues: Record<string, string>,
  ): Record<string, unknown> {
    const filters: Record<string, unknown> = {};

    switch (propertyName) {
      case 'product_id':
        filters.marketplace_id = parentValues.marketplace_id;
        break;
      case 'subscription_id':
        filters.marketplace_id = parentValues.marketplace_id;
        if (parentValues.product_id) {
          filters.product_id = parentValues.product_id;
        }
        break;
    }

    return filters;
  }
}
