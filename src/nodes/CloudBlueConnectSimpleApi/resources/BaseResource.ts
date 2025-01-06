import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  IHttpRequestMethods,
  IHttpRequestOptions,
  JsonObject,
  INodePropertyOptions,
} from 'n8n-workflow';
import type { IResource, IApiResponse, ITransformOptions } from '../interfaces';
import { CacheService } from '../utils/CacheService';
import { mapError } from '../utils/ErrorMapper';
import { validateResourceData } from '../utils/ValidationService';

interface IHttpResponse extends IDataObject {
  headers?: {
    'x-correlation-id'?: string;
  };
}

interface ITokenResponse {
  token: string;
  expiresInSeconds: number;
}

interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export abstract class BaseResource {
  protected abstract basePath: string;
  protected abstract resource: IResource;
  private cacheService: CacheService | null = null;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private tokenRefreshPromise: Promise<string> | null = null;
  private static readonly TOKEN_REFRESH_BUFFER = 60000; // 1 minute buffer
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  private shouldRetry(error: JsonObject): boolean {
    if (!error.response) return false;

    const statusCode = Number.parseInt(
      (error.response as JsonObject).status?.toString() || '500',
      10,
    );

    // Retry on server errors (500+) and timeout (408)
    return statusCode >= 500 || statusCode === 408;
  }

  protected async initializeServices(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
  ): Promise<void> {
    if (!this.cacheService) {
      const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');

      this.cacheService = new CacheService({
        enabled: credentials.enableCache as boolean,
        ttl: credentials.cacheTTL as number,
        size: credentials.cacheSize as number,
      });
    }
  }

  private async refreshToken(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
  ): Promise<string> {
    console.log('=== Starting token refresh ===');
    if (this.tokenRefreshPromise) {
      console.log('Token refresh already in progress, reusing promise');
      return this.tokenRefreshPromise;
    }

    const refreshOperation = async () => {
      console.log('Getting credentials...');
      const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');

      // Validate all required credentials
      if (!credentials.apiUrl) {
        console.log('Missing API URL');
        throw new NodeOperationError(executeFunctions.getNode(), 'API URL is required', {
          description: 'Please provide the API URL in the credentials',
        });
      }
      if (!credentials.username || !credentials.password) {
        console.log('Missing username or password');
        throw new NodeOperationError(
          executeFunctions.getNode(),
          'Username and password are required',
          { description: 'Please provide both username and password in the credentials' },
        );
      }
      if (!credentials.subscriptionKey) {
        console.log('Missing subscription key');
        throw new NodeOperationError(executeFunctions.getNode(), 'Subscription key is required', {
          description: 'Please provide the subscription key in the credentials',
        });
      }
      if (!credentials.marketplace) {
        console.log('Missing marketplace');
        throw new NodeOperationError(
          executeFunctions.getNode(),
          'Marketplace parameter is required',
          { description: 'Please provide the marketplace ID in the credentials' },
        );
      }

      const tokenUrl = `${(credentials.apiUrl as string).replace(/\/$/, '')}/auth/token`;
      console.log('Token URL:', tokenUrl);

      const options: IHttpRequestOptions = {
        method: 'POST',
        url: tokenUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${credentials.username}:${credentials.password}`,
          ).toString('base64')}`,
          'X-Subscription-Key': credentials.subscriptionKey,
        },
        body: {
          marketplace: credentials.marketplace,
        },
      };

      try {
        console.log('Making token request...');
        const response = await executeFunctions.helpers.httpRequest(options);
        console.log('Token response received');
        const responseData = response as unknown as ITokenResponse;

        const data = responseData;

        if (!data || !data.token) {
          console.log('Invalid token response:', responseData);
          throw new NodeOperationError(
            executeFunctions.getNode(),
            'Invalid token response from API',
            {
              description: JSON.stringify(
                {
                  responseKeys: Object.keys(responseData || {}),
                  hasToken: !!data?.token,
                  url: tokenUrl,
                },
                null,
                2,
              ),
            },
          );
        }

        // Validate token expiry matches API documentation
        const EXPECTED_TOKEN_EXPIRY = 1500; // 25 minutes in seconds as per API docs
        if (data.expiresInSeconds !== EXPECTED_TOKEN_EXPIRY) {
          console.log(
            `Token expiry mismatch: got ${data.expiresInSeconds}s, expected ${EXPECTED_TOKEN_EXPIRY}s`,
          );
          throw new NodeOperationError(
            executeFunctions.getNode(),
            `Token expiry (${data.expiresInSeconds}s) differs from documented value (${EXPECTED_TOKEN_EXPIRY}s)`,
            {
              description:
                'The API returned a different token expiry time than documented. This may indicate an API change.',
            },
          );
        }

        this.token = data.token;
        this.tokenExpiry =
          Date.now() + data.expiresInSeconds * 1000 - BaseResource.TOKEN_REFRESH_BUFFER;

        console.log('Token refresh successful, expires:', new Date(this.tokenExpiry).toISOString());
        return this.token;
      } catch (error) {
        console.log('Token refresh failed:', error);
        const apiError = error as JsonObject;
        const errorResponse = apiError.response as JsonObject | undefined;
        const statusCode = errorResponse?.status as number;

        // Handle 401 specifically
        if (statusCode === 401) {
          console.log('Authentication failed (401):', errorResponse?.body || errorResponse?.data);
          throw new NodeApiError(executeFunctions.getNode(), apiError, {
            message: 'Authentication failed - invalid credentials',
            description: JSON.stringify(
              {
                url: tokenUrl,
                hasUsername: !!credentials.username,
                hasPassword: !!credentials.password,
                hasSubscriptionKey: !!credentials.subscriptionKey,
                hasMarketplace: !!credentials.marketplace,
                responseError:
                  errorResponse?.body || errorResponse?.data || 'No error details provided',
              },
              null,
              2,
            ),
          });
        }

        const errorDetails = mapError(apiError);
        throw new NodeApiError(executeFunctions.getNode(), apiError, {
          ...errorDetails,
          message: 'Token refresh failed: ' + errorDetails.message,
          description: JSON.stringify(
            {
              url: tokenUrl,
              statusCode,
              response: errorResponse?.body || errorResponse?.data,
            },
            null,
            2,
          ),
        });
      } finally {
        this.tokenRefreshPromise = null;
        console.log('=== Token refresh operation completed ===');
      }
    };

    this.tokenRefreshPromise = refreshOperation();
    return this.tokenRefreshPromise;
  }

  private async getToken(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
  ): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Token is missing or expired, refresh it
    try {
      const newToken = await this.refreshToken(executeFunctions);
      if (!newToken) {
        throw new NodeOperationError(
          executeFunctions.getNode(),
          'Failed to obtain authentication token',
          {
            description: 'The token refresh operation completed but no token was returned',
          },
        );
      }
      return newToken;
    } catch (error) {
      // If it's already a NodeOperationError or NodeApiError, rethrow it
      if (error instanceof NodeOperationError || error instanceof NodeApiError) {
        throw error;
      }

      // Otherwise wrap it in a NodeOperationError
      throw new NodeOperationError(executeFunctions.getNode(), 'Authentication failed', {
        description:
          error instanceof Error
            ? `Authentication error: ${error.message}`
            : 'Unknown error during authentication',
      });
    }
  }

  protected async makeRequest<T>(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint = '',
    body?: IDataObject,
    qs?: IDataObject,
    headers: IDataObject = {},
    retryAttempt = 0,
    transformOptions?: ITransformOptions,
  ): Promise<IApiResponse<T>> {
    await this.initializeServices(executeFunctions);

    try {
      // Only cache GET requests
      if (method === 'GET') {
        const cachedData = await this.cacheService?.get<T>(
          method,
          `${this.basePath}${endpoint}`,
          body,
          qs,
        );

        if (cachedData) {
          return {
            success: true,
            data: cachedData,
          };
        }
      }

      const token = await this.getToken(executeFunctions);
      const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');

      const requestUrl = `${(credentials.apiUrl as string).replace(/\/$/, '')}${
        this.basePath
      }${endpoint}`;

      const options: IHttpRequestOptions = {
        method,
        url: requestUrl,
        body,
        qs: {
          ...qs,
          limit: qs?.limit || 10,
          offset: qs?.offset || 0,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Subscription-Key': credentials.subscriptionKey,
          ...headers,
        },
      };

      const response = await executeFunctions.helpers.httpRequest(options);
      const responseData = response as IHttpResponse;
      const transformedData = this.transformResponse(responseData, transformOptions);

      // Cache successful GET responses
      if (method === 'GET') {
        await this.cacheService?.set(
          method,
          `${this.basePath}${endpoint}`,
          transformedData,
          body,
          qs,
        );
      }

      return {
        success: true,
        data: transformedData as T,
        correlationId: responseData.headers?.['x-correlation-id'],
      };
    } catch (error) {
      const apiError = error as JsonObject;
      const errorDetails = mapError(apiError);

      if (retryAttempt < BaseResource.MAX_RETRY_ATTEMPTS && this.shouldRetry(apiError)) {
        await new Promise((resolve) =>
          setTimeout(resolve, BaseResource.RETRY_DELAY_MS * Math.pow(2, retryAttempt)),
        );
        return this.makeRequest(
          executeFunctions,
          method,
          endpoint,
          body,
          qs,
          headers,
          retryAttempt + 1,
          transformOptions,
        );
      }

      const errorResponse = apiError.response as JsonObject | undefined;
      const correlationId = errorResponse?.headers
        ? (errorResponse.headers as Record<string, string>)['x-correlation-id']
        : undefined;

      throw new NodeApiError(executeFunctions.getNode(), apiError, {
        ...errorDetails,
        message: `API request failed: ${errorDetails.message}`,
        description: JSON.stringify(
          {
            url: `${this.basePath}${endpoint}`,
            method,
            retryAttempt,
            response: errorResponse?.body,
            correlationId,
          },
          null,
          2,
        ),
      });
    }
  }

  protected validateOperationData(operation: string, data: IDataObject): void {
    const operationData = this.resource.operations[operation];
    if (!operationData) {
      throw new Error(`Operation ${operation} not found for resource ${this.resource.name}`);
    }

    validateResourceData(data, operationData.properties);
  }

  protected async getAllItems<T>(
    executeFunctions: IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body?: IDataObject,
    query: IDataObject = {},
  ): Promise<T[]> {
    const returnData: T[] = [];
    let responseData: IPaginatedResponse<T>;

    // Use API defaults if not specified
    query.limit = query.limit || 10;
    query.offset = query.offset || 0;
    let currentOffset = Number(query.offset);

    do {
      const response = await this.makeRequest<IPaginatedResponse<T>>(
        executeFunctions,
        method,
        endpoint,
        body,
        { ...query, offset: currentOffset },
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch paginated data');
      }

      responseData = response.data;
      returnData.push(...responseData.data);

      currentOffset += responseData.pagination.limit;
      query.offset = currentOffset;
    } while (returnData.length < responseData.pagination.total);

    return returnData;
  }

  protected async getPagedItems<T>(
    executeFunctions: IExecuteFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    maxRecords: number | undefined,
    body?: IDataObject,
    query: IDataObject = {},
  ): Promise<T[]> {
    if (!maxRecords) {
      return this.getAllItems<T>(executeFunctions, method, endpoint, body, query);
    }

    const returnData: T[] = [];
    let responseData: IPaginatedResponse<T>;

    query.limit = Math.min(maxRecords, 10);
    query.offset = query.offset || 0;
    let currentOffset = Number(query.offset);

    do {
      const response = await this.makeRequest<IPaginatedResponse<T>>(
        executeFunctions,
        method,
        endpoint,
        body,
        { ...query, offset: currentOffset },
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch paginated data');
      }

      responseData = response.data;
      returnData.push(...responseData.data);

      if (returnData.length >= maxRecords) {
        return returnData.slice(0, maxRecords);
      }

      currentOffset += responseData.pagination.limit;
      query.offset = currentOffset;
    } while (returnData.length < responseData.pagination.total);

    return returnData;
  }

  abstract execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IApiResponse<unknown>>;

  abstract loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentNodeParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]>;

  getResource(): IResource {
    return this.resource;
  }

  public async makeApiRequest<T>(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint = '',
    body?: IDataObject,
    qs?: IDataObject,
    headers: IDataObject = {},
  ): Promise<IApiResponse<T>> {
    return this.makeRequest(executeFunctions, method, endpoint, body, qs, headers);
  }

  protected transformResponse<T>(data: T, options?: ITransformOptions): unknown {
    if (!options) {
      return data;
    }

    let transformed: unknown = data;

    // Apply custom transformation first if provided
    if (options.custom) {
      transformed = options.custom(transformed);
    }

    // Apply field selection
    if (options.select && Array.isArray(options.select)) {
      if (Array.isArray(transformed)) {
        transformed = transformed.map((item) =>
          this.selectFields(item as Record<string, unknown>, options.select as string[]),
        );
      } else {
        transformed = this.selectFields(transformed as Record<string, unknown>, options.select);
      }
    }

    // Apply field renaming
    if (options.rename) {
      if (Array.isArray(transformed)) {
        transformed = transformed.map((item) =>
          this.renameFields(
            item as Record<string, unknown>,
            options.rename as Record<string, string>,
          ),
        );
      } else {
        transformed = this.renameFields(transformed as Record<string, unknown>, options.rename);
      }
    }

    // Apply field transformations
    if (options.transform) {
      if (Array.isArray(transformed)) {
        transformed = transformed.map((item) =>
          this.transformFields(
            item as Record<string, unknown>,
            options.transform as Record<string, (value: unknown) => unknown>,
          ),
        );
      } else {
        transformed = this.transformFields(
          transformed as Record<string, unknown>,
          options.transform,
        );
      }
    }

    // Apply filtering for array responses
    if (options.filter && Array.isArray(transformed)) {
      transformed = transformed.filter(options.filter);
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
