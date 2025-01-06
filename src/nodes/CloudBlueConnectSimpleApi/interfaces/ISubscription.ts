import type { IDataObject } from 'n8n-workflow';

export type SubscriptionStatus = 'pending' | 'active' | 'hold' | 'terminated' | 'removed';

interface ISubscriptionProduct {
    mpn: string;
    name: string;
    quantity: number;
    status: SubscriptionStatus;
}

export interface ISubscription {
    id: string;
    status: SubscriptionStatus;
    customerId: string;
    products: ISubscriptionProduct[];
    startDate: string;
    endDate?: string;
    billingPeriod?: {
        type: 'day' | 'month' | 'year';
        duration: number;
    };
    subscriptionPeriod?: {
        type: 'day' | 'month' | 'year';
        duration: number;
    };
}

export interface ISubscriptionListResponse {
    subscriptions: ISubscription[];
    total: number;
} 