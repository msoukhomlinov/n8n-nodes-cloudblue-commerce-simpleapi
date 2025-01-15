import type { INodeProperties } from 'n8n-workflow';

export interface IResource {
  name: string;
  value: string;
  description: string;
  operations: {
    [key: string]: {
      name: string;
      value: string;
      description: string;
      action: string;
      properties: INodeProperties[];
    };
  };
  properties: INodeProperties[];
}

export interface IApiError {
  message: string;
  code: number;
  details: Record<string, unknown>;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IApiError;
  correlationId?: string;
}

export interface ITransformOptions {
  // Extract specific fields from response
  select?: string[];
  // Rename fields in response
  rename?: Record<string, string>;
  // Transform specific fields
  transform?: Record<string, (value: unknown) => unknown>;
  // Filter array responses
  filter?: (item: unknown) => boolean;
  // Custom transformation function
  custom?: (data: unknown) => unknown;
}

export * from './api';
