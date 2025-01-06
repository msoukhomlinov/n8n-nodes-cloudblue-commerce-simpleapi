import type { IDataObject, INodeProperties } from 'n8n-workflow';

export interface IResource {
    name: string;
    value: string;
    description: string;
    operations: Record<string, {
        name: string;
        value: string;
        description: string;
        action: string;
        properties: INodeProperties[];
    }>;
    properties: INodeProperties[];
}

export interface IApiError {
    code: number;
    message: string;
    details: Record<string, unknown>;
}

export interface IApiResponse<T> {
    success: boolean;
    data?: T;
    error?: IApiError;
}

export interface IPaginatedResponse<T> {
    data: T[];
    meta: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
            links: {
                next?: string;
                previous?: string;
            };
        };
    };
}

export interface ISubscription extends IDataObject {
    id: string;
    name: string;
    status: string;
    type: string;
    product: {
        id: string;
        name: string;
    };
    marketplace: {
        id: string;
        name: string;
    };
}

export interface IProduct extends IDataObject {
    id: string;
    name: string;
    description: string;
    status: string;
    type: string;
    created: string;
    updated: string;
    owner: {
        id: string;
        name: string;
    };
}

export interface IMarketplace extends IDataObject {
    id: string;
    name: string;
    description: string;
    status: string;
    icon: string;
    owner: {
        id: string;
        name: string;
    };
} 