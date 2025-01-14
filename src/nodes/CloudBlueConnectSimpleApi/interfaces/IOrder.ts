import type { IDataObject } from 'n8n-workflow';
import type { IPaginatedResponse } from './IPagination';

export type OrderType = 'sales' | 'change' | 'renewal' | 'cancellation' | 'migration';
export type OrderStatus = 'draft' | 'processing' | 'error' | 'complete' | 'cancelled';

interface IPeriod {
  type: 'day' | 'month' | 'year';
  duration: number;
}

interface IOrderProduct {
  mpn: string;
  quantity?: number;
  vendor?: string;
  subscriptionId?: string;
  billingPeriod?: IPeriod;
  parameters?: Array<{
    name: string;
    value?: string;
    structured_value?: Record<string, unknown>;
  }>;
}

export interface IOrder {
  id: string;
  type: OrderType;
  status: OrderStatus;
  customerId: string;
  orderNumber: string;
  poNumber?: string;
  subscriptionPeriod?: IPeriod;
  products: IOrderProduct[];
  migrationProgram?:
    | 'count_migration_billing_period'
    | 'do_not_count_migration_billing_period'
    | 'prorate_migration_billing_period';
  migrationDate?: string;
  startDate?: string;
  creditCheck?: boolean;
  creationTime?: string;
  lastUpdateTime?: string;
}

export type IOrderListResponse = IPaginatedResponse<IOrder>;
