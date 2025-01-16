/**
 * @file API Type Definitions
 * @description Type definitions for the CloudBlue Connect API responses and requests.
 * Includes interfaces for:
 * - API responses and errors
 * - Pagination structures
 * - HTTP response wrappers
 *
 * These types ensure type safety when interacting with the CloudBlue Connect API.
 *
 * @module CloudBlueConnectSimpleApi/interfaces/api
 */

import type { IDataObject } from 'n8n-workflow';

export interface IApiError {
  code: number;
  message: string;
  details: Record<string, unknown>;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IApiError;
  correlationId?: string;
  status?: number;
  headers?: Record<string, string>;
}

export interface IPaginationResponse {
  offset: number;
  limit: number;
  total: number;
}

export interface IListResponse<T = IDataObject> {
  data: T[];
  pagination: IPaginationResponse;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: IPaginationResponse;
}

export interface IHttpResponse extends IDataObject {
  headers?: {
    'x-correlation-id'?: string;
  };
}
