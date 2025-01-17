/**
 * @file Order Type Definitions
 * @description Type definitions for the Order resource.
 *
 * Defines:
 * - Core order interfaces and enums
 * - Order status and detail type enums
 * - Nested types for order components (prices, durations, products)
 * - Request/Response types for API interactions
 * - Filter types for list operations
 *
 * @module CloudBlueCommerceSimpleApi/resources/order/types
 */

import type { IDataObject } from 'n8n-workflow';

export enum OrderStatus {
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  ERROR = 'error',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderDetailType {
  UNKNOWN = 'unknown',
  SETUP = 'setup',
  SETUP_REFUND = 'setupRefund',
  SWITCH = 'switch',
  RENEW = 'renew',
  RENEW_REFUND = 'renewRefund',
  TRANSFER = 'transfer',
  TRANSFER_REFUND = 'transferRefund',
  RECURRING = 'recurring',
  RECURRING_REFUND = 'recurringRefund',
  OVERUSE = 'overuse',
  DOWNGRADE = 'downgrade',
  DISCOUNT = 'discount',
  ADJUSTMENT = 'adjustment',
  CANCELLATION = 'cancellation',
  HANDLING_FEE = 'handlingFee',
  NON_PROVISIONING_ITEM = 'nonProvisioningItem',
  PAYMENT = 'payment',
  REFUND = 'refund',
  REFUND_ADJUSTMENT = 'refundAdjustment',
  BILL_PENALTY = 'billPenalty',
  BILL_RECORD = 'billRecord',
  RESELLER_PAYMENT = 'resellerPayment',
  DEPOSIT = 'deposit',
}

export interface IOrderPrice {
  currency: string;
  amount: string;
}

export interface IDuration {
  type: 'day' | 'month' | 'year' | 'statement_day' | 'unknown';
  duration: number;
}

export interface IDiscount {
  type: 'percent' | 'fixed' | 'unknown';
  value?: string;
  amount?: string;
  amountCode?: string;
}

export interface IOrderDetail {
  type: OrderDetailType;
  mpn: string;
  productId?: string;
  duration?: IDuration;
  description?: string;
  quantity: number;
  unitPrice?: IOrderPrice;
  salesUnitPrice?: IOrderPrice;
  extendedPrice?: IOrderPrice;
  salesExtendedPrice?: IOrderPrice;
  discount?: IDiscount;
  salesDiscount?: IDiscount;
  taxAmount?: IOrderPrice;
  salesTaxAmount?: IOrderPrice;
  exclusiveTaxAmount?: IOrderPrice;
  salesExclusiveTaxAmount?: IOrderPrice;
  exchangeRate?: number;
  exchangeTime?: string;
}

export interface IParameterValue {
  name: string;
  value: any;
  structured_value?: any;
}

export interface IOrderPriceTier {
  lowerLimit: string;
  amount: string;
}

export interface IOrderSpecialPrice {
  currency: string;
  amount: string;
  priceTiers?: IOrderPriceTier[];
}

export interface IOrderSpecialCost {
  currency: string;
  amount: string;
}

export interface IOrderMarginRate {
  original: string;
  new: string;
}

export interface IOrderMargin {
  priceModel: 'MSRP' | 'COS' | 'UNKNOWN';
  totalRate: IOrderMarginRate;
  rates: IOrderMarginRateInfo[];
  attributes?: IOrderMarginAttribute[];
}

export interface IOrderMarginRateInfo {
  sellerId: string;
  buyerId: string;
  rate: IOrderMarginRate;
}

export interface IOrderMarginAttribute {
  attribute: string;
  attributeValue: string;
  totalMargin: string;
  resellerMargin: string;
}

export interface IOrderLineProduct {
  mpn: string;
  vendor?: string;
  id?: string;
  billingPeriod?: IDuration;
  subscriptionPeriod?: IDuration;
  newMPN?: string;
  newId?: string;
  name?: string;
  quantity: number;
  extendedPrice?: IOrderPrice;
  specialPrice?: IOrderSpecialPrice;
  specialCost?: IOrderSpecialCost;
  parameters?: IParameterValue[];
  type?:
    | 'CREATE'
    | 'RENEW'
    | 'CANCEL'
    | 'UPGRADE'
    | 'CHANGE_PLAN_PERIOD'
    | 'TRANSFER'
    | 'STOP_SERVICE'
    | 'DESTROY_SERVICE'
    | 'ONE_TIME_FEE'
    | 'BILLING_SUBSCRIPTION'
    | 'VENDOR_RATED_DATA'
    | 'MIGRATION'
    | 'MOVE';
  margins?: IOrderMargin;
}

export interface ISubscriptionTcvDetailsInfo {
  planId?: string;
  alignedExpirationDate?: string;
  tcvs?: any[]; // Detailed TCV info structure if needed
}

export interface IAlignExpirationDate {
  alignmentType:
    | 'CO_TERM_ON_SUBSCRIPTION'
    | 'MATCH_END_OF_CALENDAR_MONTH'
    | 'CO_TERM_PARTIAL_UPGRADE';
  subscriptionId?: number;
}

export interface IOrderVendorBillingSettings {
  vendorBillingPeriod: IDuration;
}

export interface IOrder extends IDataObject {
  id: string;
  orderNumber: string;
  type: 'sales' | 'change' | 'renewal' | 'cancellation' | 'migration' | 'unknown';
  customerId: string;
  poNumber?: string;
  creationDate: string;
  provisioningDate?: string;
  status: OrderStatus;
  statusCode?: string;
  total?: IOrderPrice;
  details?: IOrderDetail[];
  attributes?: Record<string, string>;
  creditCheck?: boolean;
  autorenewal?: boolean;
  startDate?: string;
  migrationDate?: string;
  expirationDate?: string;
  lastBillingDate?: string;
  nextBillingDate?: string;
  migrationProgram?: string;
  planId?: string;
  subscriptionPeriod?: IDuration;
  scheduledOn?: string;
  upgradeStartType?: string;
  products?: IOrderLineProduct[];
  subscriptionId?: string;
  targetSubscriptionId?: string;
  billingModel?:
    | 'chargeBeforeBillingPeriod'
    | 'chargeAfterBillingPeriod'
    | 'chargeBeforeSubscriptionPeriod'
    | 'chargeExternalRating';
  subscriptions?: ISubscriptionTcvDetailsInfo[];
  alignExpirationDate?: IAlignExpirationDate;
  placementType?: 'MOVE';
  vendorBillingSettings?: IOrderVendorBillingSettings;
}

export interface IOrderListResponse {
  data: IOrder[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface IOrderFilter extends IDataObject {
  customerId?: string;
  subscriptionId?: string;
  orderNumber?: string;
  status?: OrderStatus;
  creationTimeFrom?: string;
  creationTimeTo?: string;
  statusCode?: string;
  offset?: number;
  limit?: number;
}

/**
 * Interface for order update request body
 */
export interface IOrderUpdate extends IDataObject {
  /**
   * Whether customer's credit should be checked on order processing
   */
  creditCheck?: boolean;

  /**
   * Internal status code of the order
   */
  statusCode?: string;
}
