import type { IDataObject } from 'n8n-workflow';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  HOLD = 'hold',
  TERMINATED = 'terminated',
  REMOVED = 'removed',
  UNKNOWN = 'unknown',
}

export type BillingModelType =
  | 'chargeBeforeBillingPeriod'
  | 'chargeAfterBillingPeriod'
  | 'chargeBeforeSubscriptionPeriod'
  | 'chargeExternalRating';

export type PeriodType = 'day' | 'month' | 'year' | 'statement_day' | 'unknown';

export interface IPeriod {
  type: PeriodType;
  duration: number;
}

export interface IPrice {
  currency: string;
  amount: string;
}

// Parameter interfaces for detailed view
export interface IParameterValue {
  name: string;
  value?: string;
  structured_value?: Record<string, unknown>;
}

export interface ISubscriptionProduct {
  mpn: string;
  vendor: string;
  id: string;
  quantity: number;
  name: string;
  unitPrice: IPrice;
  extendedPrice: IPrice;
  vendorSubscriptionId?: string;
}

// Base subscription interface (used in list operations)
export interface ISubscription extends IDataObject {
  id: string;
  name: string;
  customerId: string;
  status: SubscriptionStatus | null;
  type?: string;
  attributes: Record<string, unknown>;
  renewalStatus: boolean;
  creationDate: string | null;
  lastModifiedDate: string | null;
  expirationDate: string | null;
  billingModel: BillingModelType | null;
  billingPeriod: IPeriod;
  subscriptionPeriod: IPeriod;
  planId: number | null;
  product?: {
    id: string;
    name: string;
  };
  marketplace?: {
    id: string;
    name: string;
  };
}

// Detailed subscription interface (used in get single operation)
export interface ISubscriptionDetailed extends ISubscription {
  totalPrice: IPrice;
  products: ISubscriptionProduct[];
  orderParameters: IParameterValue[];
  fulfillmentParameters: IParameterValue[];
}

// Response interfaces
export interface ISubscriptionListResponse {
  data: ISubscription[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface ISubscriptionDetailedResponse {
  data: ISubscriptionDetailed;
}
