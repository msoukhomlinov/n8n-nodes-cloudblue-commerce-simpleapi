import type { IDataObject } from 'n8n-workflow';
import type { IPaginatedResponse } from './IPagination';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export interface ISubscription {
  id: string;
  name: string;
  customerId: string;
  status: SubscriptionStatus;
  attributes: Record<string, unknown>;
  renewalStatus: boolean;
  creationDate?: string;
  lastModifiedDate: string;
  expirationDate?: string;
  billingModel: string;
  billingPeriod: {
    type: 'month' | 'year';
    duration: number;
  };
  subscriptionPeriod: {
    type: 'month' | 'year';
    duration: number;
  };
}

export interface ISubscriptionListResponse {
  data: ISubscription[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}
