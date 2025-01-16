/**
 * @file Error Handling Utilities
 * @description Provides centralized error handling for the CloudBlue Connect Simple API integration.
 * Includes custom error types and handlers for:
 * - API-specific errors with retry logic
 * - Rate limit handling
 * - Error transformation for n8n compatibility
 *
 * @module CloudBlueConnectSimpleApi/utils/errorHandler
 */

import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject, INode, JsonObject } from 'n8n-workflow';

interface IHttpError {
  response?: {
    statusCode: number;
    body: IDataObject;
    headers: Record<string, string>;
  };
  error?: Error;
  message?: string;
}

export class CloudBlueError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpCode?: number,
    public readonly data?: IDataObject,
  ) {
    super(message);
    this.name = 'CloudBlueError';
  }
}

export function handleErrorWithRetry(
  error: unknown,
  node: INode,
  itemIndex: number,
  retryAttempt = 0,
  maxRetries = 3,
): never {
  const errorData = error as IHttpError;
  const httpError = {
    message: errorData.message,
    statusCode: errorData.response?.statusCode,
    body: errorData.response?.body,
    headers: errorData.response?.headers,
    errorMessage: errorData.error?.message,
  } as JsonObject;

  if (error instanceof CloudBlueError) {
    const errorObject = {
      message: error.message,
      code: error.code,
      httpCode: error.httpCode,
      data: error.data,
    } as JsonObject;

    // Handle rate limits
    if (error.httpCode === 429 && retryAttempt < maxRetries) {
      const retryAfter = (error.data?.retryAfter as number) || 60;
      throw new NodeApiError(node, errorObject, {
        message: `Rate limit exceeded. Retrying in ${retryAfter} seconds...`,
        description: `Attempt ${retryAttempt + 1} of ${maxRetries}`,
      });
    }

    // Handle specific CloudBlue errors
    switch (error.code) {
      case 'AUTH_001': {
        throw new NodeApiError(node, errorObject, {
          message: 'Authentication failed. Please check your API credentials.',
          description: 'Verify your API token and URL in the credentials settings.',
        });
      }
      case 'INVALID_INPUT': {
        throw new NodeOperationError(node, error.message, {
          itemIndex,
          description: 'Please check the input parameters.',
        });
      }
      default: {
        throw new NodeApiError(node, errorObject);
      }
    }
  }

  if (httpError.response) {
    const status = (httpError as JsonObject & { response: { statusCode: number } }).response
      .statusCode;
    const data = (httpError as JsonObject & { response: { body: IDataObject } }).response.body;

    // Handle specific HTTP status codes
    switch (status) {
      case 400: {
        throw new NodeOperationError(node, 'Invalid request parameters', {
          itemIndex,
          description: data.message as string,
        });
      }
      case 401: {
        throw new NodeApiError(node, httpError, {
          message: 'Authentication failed',
          description: 'Please check your API credentials.',
        });
      }
      case 403: {
        throw new NodeApiError(node, httpError, {
          message: 'Access forbidden',
          description: 'Your API token does not have permission for this operation.',
        });
      }
      case 404: {
        throw new NodeOperationError(node, 'Resource not found', {
          itemIndex,
          description: `The requested resource could not be found: ${data.message as string}`,
        });
      }
      case 429: {
        const retryAfter = Number.parseInt(
          (httpError as JsonObject & { response: { headers: Record<string, string> } }).response
            .headers['retry-after'] || '60',
          10,
        );
        throw new NodeApiError(node, httpError, {
          message: `Rate limit exceeded. Retrying in ${retryAfter} seconds...`,
          description: `Attempt ${
            retryAttempt + 1
          } of ${maxRetries}. Will retry after ${retryAfter} seconds.`,
        });
      }
      default: {
        throw new NodeApiError(node, httpError);
      }
    }
  }

  // Handle network errors
  if (httpError.error) {
    throw new NodeApiError(node, httpError, {
      message: 'Network error occurred',
      description: 'Please check your network connection and API endpoint.',
    });
  }

  // Handle unknown errors
  if (error instanceof Error) {
    throw new NodeOperationError(node, error.message, { itemIndex });
  }

  throw new NodeOperationError(node, 'Unknown error occurred', { itemIndex });
}
