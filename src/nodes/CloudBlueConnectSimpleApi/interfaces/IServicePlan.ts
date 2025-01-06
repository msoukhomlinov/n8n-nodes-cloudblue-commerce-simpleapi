export interface IServicePlanPrice {
    amount: string;
    currency: string;
    type: 'one-time' | 'recurring';
    period?: string;
    unitLabel?: string;
}

export interface IServicePlan {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    version: number;
    commitment?: {
        count: number;
        period: string;
    };
    technical?: boolean;
    title?: string;
    displayOrder?: number;
    prices: IServicePlanPrice[];
    metaData?: Record<string, unknown>;
    created: string;
    updated: string;
}

export interface IServicePlanListResponse {
    plans: IServicePlan[];
    total: number;
} 