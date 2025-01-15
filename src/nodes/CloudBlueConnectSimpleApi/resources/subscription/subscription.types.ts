import type { IDataObject } from 'n8n-workflow';

export interface ISubscription extends IDataObject {
  id: string;
  name: string;
  customerId: string;
  status: SubscriptionStatus;
  attributes: Record<string, unknown>;
  renewalStatus: boolean;
  creationDate: string;
  renewalDate?: string;
  lastModifiedDate: string;
  expirationDate: string;
  billingModel: string;
  billingPeriod: {
    type: 'day' | 'month' | 'year' | 'statement_day' | 'unknown';
    duration: number;
  };
  subscriptionPeriod: {
    type: 'day' | 'month' | 'year' | 'statement_day' | 'unknown';
    duration: number;
  };
}

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  HOLD = 'hold',
  TERMINATED = 'terminated',
  REMOVED = 'removed',
}

export interface ISubscriptionListResponse {
  data: ISubscription[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}
