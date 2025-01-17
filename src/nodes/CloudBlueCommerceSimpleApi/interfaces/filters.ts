/**
 * @file Filter Interfaces
 * @description Common filter interfaces used across the application
 *
 * @module CloudBlueCommerceSimpleApi/interfaces/filters
 */

import type { IDataObject } from 'n8n-workflow';

export interface IDateFilter {
  presetDate?: { preset: string };
  datePicker?: { date: string };
}

export interface ISubscriptionFilter extends IDataObject {
  customerId?: string;
  creationDateFrom?: string;
  creationDateTo?: string;
  status?: 'pending' | 'active' | 'hold' | 'terminated' | 'removed';
  offset?: number;
  limit?: number;
}
