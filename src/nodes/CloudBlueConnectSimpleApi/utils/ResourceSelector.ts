import type {
    ILoadOptionsFunctions,
    INodePropertyOptions,
} from 'n8n-workflow';
import type { BaseResource } from '../resources/BaseResource';

export class ResourceSelector {
    constructor(private resource: BaseResource) {}

    async loadHierarchicalOptions(
        loadOptionsFunctions: ILoadOptionsFunctions,
        propertyName: string,
        currentParameters: Record<string, unknown>,
        parentFields: string[] = [],
    ): Promise<INodePropertyOptions[]> {
        // Get parent values to filter options
        const parentValues: Record<string, string> = {};
        for (const field of parentFields) {
            const value = currentParameters[field] as string;
            if (!value) {
                // If any parent value is missing, return empty options
                return [];
            }
            parentValues[field] = value;
        }

        // Load options based on property and parent values
        const response = await this.resource.makeApiRequest<{ data: Array<{ id: string; name: string }> }>(
            loadOptionsFunctions,
            'GET',
            this.getEndpointForProperty(propertyName, parentValues),
            undefined,
            { limit: 100, ...this.getFiltersForProperty(propertyName, parentValues) },
        );

        if (!response.success || !response.data?.data) {
            throw new Error(`Failed to load options for ${propertyName}`);
        }

        return this.formatOptionsResponse(response.data.data, propertyName);
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
        const filters: Record<string, unknown> = { status: 'active' };

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

    private formatOptionsResponse(
        data: Array<{ id: string; name: string }>,
        propertyName: string,
    ): INodePropertyOptions[] {
        return data.map((item) => ({
            name: item.name,
            value: item.id,
            description: `ID: ${item.id}`,
        }));
    }
} 