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
}

export interface IPagination {
  offset: number;
  limit: number;
  total: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

export interface IHttpResponse extends IDataObject {
  headers?: {
    'x-correlation-id'?: string;
  };
}
