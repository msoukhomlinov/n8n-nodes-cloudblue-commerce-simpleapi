import type {
  IDataObject,
  IExecuteFunctions,
  JsonObject,
  ILoadOptionsFunctions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { mapError } from '../utils/ErrorMapper';
import type { ITransformOptions, IPaginatedResponse } from '../interfaces';

interface IHttpResponse extends IDataObject {
  headers?: {
    'x-correlation-id'?: string;
  };
}

export class ResponseProcessingService {
  public static readonly MAX_RETRY_ATTEMPTS = 3;
  public static readonly RETRY_DELAY_MS = 1000;

  public processResponse<T>(
    response: unknown,
    options?: {
      transformOptions?: ITransformOptions;
      endpoint?: string;
      method?: string;
      correlationId?: string;
    },
  ): IPaginatedResponse<T> {
    // Transform response if options provided
    const transformedData = options?.transformOptions
      ? this.transformResponse(response as IPaginatedResponse<T>, options.transformOptions)
      : response;

    return transformedData as IPaginatedResponse<T>;
  }

  public handleError(
    error: JsonObject,
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    context: {
      endpoint: string;
      method: string;
      retryAttempt: number;
    },
  ): never {
    const errorResponse = error.response as JsonObject | undefined;
    const correlationId = errorResponse?.headers
      ? (errorResponse.headers as Record<string, string>)['x-correlation-id']
      : undefined;

    const errorDetails = mapError(error);
    throw new NodeApiError(executeFunctions.getNode(), error, {
      ...errorDetails,
      message: `API request failed: ${errorDetails.message}`,
      description: JSON.stringify(
        {
          url: context.endpoint,
          method: context.method,
          retryAttempt: context.retryAttempt,
          response: errorResponse?.body,
          correlationId,
        },
        null,
        2,
      ),
    });
  }

  public shouldRetry(error: JsonObject): boolean {
    if (!error.response) return false;

    const statusCode = Number.parseInt(
      (error.response as JsonObject).status?.toString() || '500',
      10,
    );

    // Retry on server errors (500+) and timeout (408)
    return statusCode >= 500 || statusCode === 408;
  }

  private transformResponse<T>(
    data: IPaginatedResponse<T>,
    options: ITransformOptions,
  ): IPaginatedResponse<T> {
    let transformed = { ...data };

    // Apply custom transformation first if provided
    if (options.custom) {
      transformed = options.custom(transformed) as IPaginatedResponse<T>;
    }

    // Apply field selection
    if (options.select && Array.isArray(options.select)) {
      transformed.data = transformed.data.map((item) =>
        this.selectFields(item as Record<string, unknown>, options.select as string[]),
      ) as T[];
    }

    // Apply field renaming
    if (options.rename) {
      transformed.data = transformed.data.map((item) =>
        this.renameFields(
          item as Record<string, unknown>,
          options.rename as Record<string, string>,
        ),
      ) as T[];
    }

    // Apply field transformations
    if (options.transform) {
      transformed.data = transformed.data.map((item) =>
        this.transformFields(
          item as Record<string, unknown>,
          options.transform as Record<string, (value: unknown) => unknown>,
        ),
      ) as T[];
    }

    // Apply filtering for array responses
    if (options.filter) {
      transformed.data = transformed.data.filter(options.filter) as T[];
    }

    return transformed;
  }

  private selectFields(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const field of fields) {
      if (field in data) {
        result[field] = data[field];
      }
    }
    return result;
  }

  private renameFields(
    data: Record<string, unknown>,
    renames: Record<string, string>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...data };
    for (const [oldName, newName] of Object.entries(renames)) {
      if (oldName in result) {
        result[newName] = result[oldName];
        delete result[oldName];
      }
    }
    return result;
  }

  private transformFields(
    data: Record<string, unknown>,
    transforms: Record<string, (value: unknown) => unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...data };
    for (const [field, transform] of Object.entries(transforms)) {
      if (field in result) {
        result[field] = transform(result[field]);
      }
    }
    return result;
  }
}
