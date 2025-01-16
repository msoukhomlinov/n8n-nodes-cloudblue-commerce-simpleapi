/**
 * @file Subscription Type Definitions
 * @description Type definitions for the Subscription resource.
 * Defines:
 * - Core subscription interfaces and types
 * - Subscription status and billing enums
 * - Request/Response types for API interactions
 * - Nested types for subscription components (periods, prices, parameters)
 *
 * @module CloudBlueConnectSimpleApi/resources/subscription/types
 */

import type { IDataObject } from 'n8n-workflow';
import type { IPaginatedResponse, IApiResponse } from '../../interfaces/api';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  HOLD = 'hold',
  TERMINATED = 'terminated',
  REMOVED = 'removed',
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
  unitCost?: IPrice;
  unitProviderCost?: IPrice;
  extendedPrice: IPrice;
  vendorSubscriptionId?: string;
}

// Base subscription interface (used in list operations)
export interface ISubscription extends IDataObject {
  id: string;
  name: string;
  customerId: string;
  status: SubscriptionStatus | 'unknown';
  attributes: Record<string, string>;
  renewalStatus: boolean;
  creationDate: string | null;
  renewalDate?: string | null;
  lastModifiedDate: string | null;
  expirationDate: string | null;
  billingModel: BillingModelType | null;
  billingPeriod: IPeriod;
  subscriptionPeriod: IPeriod;
  planId: number | null;
}

// Detailed subscription interface (used in get single operation)
export interface ISubscriptionDetailed extends ISubscription {
  totalPrice: IPrice;
  totalSubscriptionPrice?: IPrice;
  totalSubscriptionCost?: IPrice;
  totalSubscriptionProviderCost?: IPrice;
  products: ISubscriptionProduct[];
  orderParameters: IParameterValue[];
  fulfillmentParameters: IParameterValue[];
}

// Update interfaces
export interface ISubscriptionProductUpdate {
  mpn?: string;
  id?: string;
  unitPrice?: {
    currency: string;
    amount: string;
    priceTiers?: Array<{
      range_start: number;
      range_end: number;
      price: number;
    }>;
  };
  unitCost?: {
    currency: string;
    amount: string;
    priceTiers?: Array<{
      range_start: number;
      range_end: number;
      price: number;
    }>;
  };
  unitProviderCost?: {
    currency: string;
    amount: string;
  };
}

export interface ISubscriptionUpdate extends IDataObject {
  products?: ISubscriptionProductUpdate[];
  attributes?: Record<string, string>;
  renewalStatus?: boolean;
}

// Response interfaces
export type ISubscriptionListResponse = IPaginatedResponse<ISubscription>;

export type ISubscriptionDetailedResponse = IApiResponse<ISubscriptionDetailed>;
