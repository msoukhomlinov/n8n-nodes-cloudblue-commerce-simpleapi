/**
 * @file Plan Resource Type Definitions
 * @description Type definitions for the Plan resource based on the OpenAPI specification.
 * Implements:
 * - Base Plan interface
 * - Detailed Plan interface
 * - Plan Filter interface
 * - Supporting types and enums
 *
 * @module CloudBlueCommerceSimpleApi/resources/plan
 */

import type { IDataObject } from 'n8n-workflow';

export enum BillingModel {
  CHARGE_BEFORE_BILLING_PERIOD = 'chargeBeforeBillingPeriod',
  CHARGE_AFTER_BILLING_PERIOD = 'chargeAfterBillingPeriod',
  CHARGE_BEFORE_SUBSCRIPTION_PERIOD = 'chargeBeforeSubscriptionPeriod',
  CHARGE_EXTERNAL_RATING = 'chargeExternalRating',
  UNKNOWN = 'unknown',
}

export enum PeriodType {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
  STATEMENT_DAY = 'statement_day',
  UNKNOWN = 'unknown',
}

export enum BillingPolicy {
  PERIOD_CHANGE = 'period_change',
  PRORATE_STARTING_NEW_SUBSCRIPTION_PERIOD = 'prorate_starting_new_subscription_period',
  PRORATE_KEEPING_EXP_DATE = 'prorate_keeping_exp_date',
  PRORATE_REFUND = 'prorate_refund',
  NO_REFUND = 'no_refund',
  NO_REFUND_WITH_FULL_REFUND_PERIOD = 'no_refund_with_full_refund_period',
  PRORATE_REFUND_WITH_FULL_REFUND_PERIOD = 'prorate_refund_with_full_refund_period',
  UNKNOWN = 'unknown',
}

export enum WhenEffective {
  IMMEDIATELY = 'immediately',
  NEXT_BILLING_PERIOD = 'next_billing_period',
  NEXT_SUBSCRIPTION_PERIOD = 'next_subscription_period',
  UNKNOWN = 'unknown',
}

export interface ISubscriptionPeriod {
  type: PeriodType;
  duration: number;
  trial: boolean;
  active: boolean;
}

export interface IBillingPeriod {
  type: PeriodType;
  duration: number;
}

export interface IServicePlanSubscriptionPeriodSwitch {
  planId: number;
  subscriptionPeriod: IBillingPeriod;
  billingPolicy: BillingPolicy;
  whenEffective: WhenEffective;
  sourceSubscriptionPeriod: IBillingPeriod;
}

export interface IPlan extends IDataObject {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  published: boolean;
  subscriptionPeriods: ISubscriptionPeriod[];
  billingPeriod: IBillingPeriod;
  billingModel: BillingModel;
}

export interface IPlanDetailed extends IPlan {
  planSwitches: IServicePlanSubscriptionPeriodSwitch[];
}

export interface IPlanFilter extends IDataObject {
  limit?: number;
}

export interface IResultListServicePlan {
  data: IPlan[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}
