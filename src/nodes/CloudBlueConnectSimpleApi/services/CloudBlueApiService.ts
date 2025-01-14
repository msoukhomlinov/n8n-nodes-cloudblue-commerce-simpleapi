import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHttpRequestOptions,
  JsonObject,
  IDataObject,
  IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { IApiResponse } from '../interfaces';

// Debug flag - set to true to enable detailed request/response logging
const DEBUG_API_SERVICE = true;

interface ErrorWithResponse extends Error {
  response?: {
    statusCode: number;
  };
}

export class CloudBlueApiService {
  private static instance: CloudBlueApiService;
  private token: string | undefined;
  private tokenExpiry: number | undefined;

  private constructor() {}

  private logDebug(message: string, data?: unknown) {
    if (DEBUG_API_SERVICE) {
      console.log('\n=== CloudBlueApiService Debug ===');
      console.log(message);
      if (data) {
        // Deep clone the data to avoid modifying the original
        const sanitizedData = JSON.parse(JSON.stringify(data));

        // Redact sensitive information
        if (sanitizedData.headers?.Authorization) {
          sanitizedData.headers.Authorization = sanitizedData.headers.Authorization.replace(
            /(Bearer\s+)[^\s]+/,
            '$1[REDACTED]',
          );
        }
        if (sanitizedData.headers?.['X-Subscription-Key']) {
          sanitizedData.headers['X-Subscription-Key'] = '[REDACTED]';
        }

        console.log(JSON.stringify(sanitizedData, null, 2));
      }
      console.log('================================\n');
    }
  }

  public static getInstance(): CloudBlueApiService {
    if (!CloudBlueApiService.instance) {
      CloudBlueApiService.instance = new CloudBlueApiService();
    }
    return CloudBlueApiService.instance;
  }

  public async getToken(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
  ): Promise<string> {
    const now = Date.now();

    // Check if token is still valid
    if (this.token && this.tokenExpiry && now < this.tokenExpiry) {
      return this.token;
    }

    const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');
    const options: IHttpRequestOptions = {
      method: 'POST',
      url: '/token',
      baseURL: (credentials.authUrl as string).replace(/\/+$/, ''),
      body: {
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        scope: 'openid',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    };

    try {
      const response = (await executeFunctions.helpers.httpRequest(options)) as {
        access_token: string;
        expires_in: number;
      };
      this.token = response.access_token;
      this.tokenExpiry = now + response.expires_in * 1000;
      return this.token;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorObject: JsonObject = {
          message: error.message || 'Unknown error',
          name: error.name || 'Error',
        };

        if (error.stack) {
          errorObject.stack = error.stack;
        }

        const apiError = error as ErrorWithResponse;
        if (apiError.response?.statusCode) {
          errorObject.statusCode = apiError.response.statusCode.toString();
        }

        throw new NodeApiError(executeFunctions.getNode(), errorObject, {
          message: 'Failed to obtain access token',
          description: error.message || 'Unknown error',
          httpCode: apiError.response?.statusCode.toString(),
        });
      }
      throw error;
    }
  }

  async makeRequest<T>(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body?: IDataObject,
    qs?: IDataObject,
  ): Promise<IApiResponse<T>> {
    const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');
    const token = await this.getToken(executeFunctions);

    const options: IHttpRequestOptions = {
      method,
      baseURL: (credentials.apiUrl as string).replace(/\/+$/, ''),
      url: endpoint,
      body,
      qs,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Subscription-Key': credentials.subscriptionKey as string,
      },
    };

    try {
      this.logDebug('Request:', {
        url: `${options.baseURL}${endpoint}`,
        method,
        headers: options.headers,
        queryParams: qs,
        body,
      });

      const response = await executeFunctions.helpers.httpRequest(options);

      this.logDebug('Response:', {
        statusCode: 200, // n8n's httpRequest doesn't expose status code on success
        body: response,
      });

      // Handle array-wrapped response with success check
      if (Array.isArray(response) && response.length > 0) {
        const firstItem = response[0];
        if (!firstItem.success) {
          throw new Error('API response indicates failure');
        }
        return {
          success: true,
          data: firstItem.data,
        };
      }

      // For non-array responses, wrap in success structure
      return {
        success: true,
        data: response as T,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorObject: JsonObject = {
          message: error.message || 'Unknown error',
          name: error.name || 'Error',
        };

        if (error.stack) {
          errorObject.stack = error.stack;
        }

        const apiError = error as ErrorWithResponse;
        if (apiError.response?.statusCode) {
          errorObject.statusCode = apiError.response.statusCode.toString();
        }

        this.logDebug('Error Response:', {
          error: errorObject,
          statusCode: apiError.response?.statusCode,
        });

        throw new NodeApiError(executeFunctions.getNode(), errorObject, {
          message: 'API request failed',
          description: error.message || 'Unknown error',
          httpCode: apiError.response?.statusCode.toString(),
        });
      }
      throw error;
    }
  }
}
