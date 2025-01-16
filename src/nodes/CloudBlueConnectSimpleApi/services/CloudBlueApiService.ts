/**
 * @file CloudBlue API Service
 * @description Core service for interacting with the CloudBlue Connect API.
 * Implements:
 * - Authentication and token management
 * - Request handling with automatic retries
 * - Error handling and response transformation
 * - URL construction and parameter handling
 *
 * Uses singleton pattern to maintain a single authenticated instance.
 *
 * @module CloudBlueConnectSimpleApi/services/CloudBlueApiService
 */

import type { IDataObject } from 'n8n-workflow';
import { debugLog } from '../utils/debug';
import { CloudBlueError } from '../utils/errorHandler';
import type { IHttpResponse } from '../interfaces/api';

interface ICloudBlueErrorResponse {
  message?: string;
  code?: string;
  statusCode?: number;
  details?: IDataObject;
}

export interface ICloudBlueApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface IRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: IDataObject;
  params?: IDataObject;
  headers?: Record<string, string>;
}

export class CloudBlueApiService {
  private static instance: CloudBlueApiService;
  private readonly baseUrl: string;
  private readonly authUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly subscriptionKey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor(
    baseUrl: string,
    authUrl: string,
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    subscriptionKey: string,
  ) {
    this.baseUrl = baseUrl;
    this.authUrl = authUrl;
    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.subscriptionKey = subscriptionKey;
  }

  public static getInstance(
    baseUrl: string,
    authUrl: string,
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    subscriptionKey: string,
  ): CloudBlueApiService {
    if (!CloudBlueApiService.instance) {
      CloudBlueApiService.instance = new CloudBlueApiService(
        baseUrl,
        authUrl,
        username,
        password,
        clientId,
        clientSecret,
        subscriptionKey,
      );
    }
    return CloudBlueApiService.instance;
  }

  private async authenticate(): Promise<string> {
    debugLog('AUTH_FLOW', 'Authenticating with OAuth2', {
      authUrl: this.authUrl,
      username: this.username,
      clientId: this.clientId,
    });

    const authUrl = `${this.authUrl}/token`;
    const body = new URLSearchParams({
      grant_type: 'password',
      username: this.username,
      password: this.password,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'openid',
    });

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as IDataObject;
        debugLog('AUTH_FLOW', 'Authentication failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new CloudBlueError('Authentication failed', 'AUTH_ERROR', response.status, errorData);
      }

      interface IAuthResponse {
        access_token: string;
        expires_in: number;
      }

      const data = (await response.json()) as IAuthResponse;
      this.accessToken = data.access_token;
      // Set token expiry to 5 minutes before actual expiry
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      debugLog('AUTH_FLOW', 'Authentication successful', {
        expiresIn: data.expires_in,
      });

      return this.accessToken;
    } catch (error) {
      debugLog('AUTH_FLOW', 'Authentication error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async getValidToken(): Promise<string> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      return this.authenticate();
    }
    return this.accessToken;
  }

  public async request<T = unknown>(options: IRequestOptions): Promise<ICloudBlueApiResponse<T>> {
    const token = await this.getValidToken();
    const { method, url, data, params, headers = {} } = options;
    const fullUrl = this.buildUrl(url, params);

    debugLog('API_REQUEST', 'Making API request', {
      method,
      url: fullUrl,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Subscription-Key': this.subscriptionKey,
      },
      params,
    });

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Subscription-Key': this.subscriptionKey,
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ICloudBlueErrorResponse;
        debugLog('API_ERROR', 'API request failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        throw new CloudBlueError(
          errorData.message || response.statusText,
          errorData.code || 'API_ERROR',
          response.status,
          errorData.details || {},
        );
      }

      const responseText = await response.text();
      debugLog('API_RESPONSE', 'Pre-parsed response', responseText);

      const responseData = JSON.parse(responseText);
      const apiResponse = {
        data: responseData as T,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };

      debugLog('API_RESPONSE', 'Received API response', apiResponse);

      return apiResponse;
    } catch (error) {
      debugLog('API_ERROR', 'API request error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private buildUrl(path: string, params?: IDataObject): string {
    const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(cleanPath, baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    debugLog('API_URL', 'Constructed URL', {
      baseUrl,
      path: cleanPath,
      params,
      fullUrl: url.toString(),
    });

    return url.toString();
  }

  public async get<T = unknown>(
    url: string,
    params?: IDataObject,
  ): Promise<ICloudBlueApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  public async getMany<T = unknown>(
    url: string,
    params?: IDataObject,
    limit?: number,
    offset?: number,
  ): Promise<ICloudBlueApiResponse<T>> {
    const queryParams: IDataObject = { ...params };
    if (limit !== undefined) queryParams.limit = limit;
    if (offset !== undefined) queryParams.offset = offset;

    return this.request<T>({
      method: 'GET',
      url,
      params: queryParams,
    });
  }

  public async patch<T = unknown>(
    url: string,
    data?: IDataObject,
    params?: IDataObject,
  ): Promise<ICloudBlueApiResponse<T>> {
    return await this.request<T>({
      method: 'PATCH',
      url,
      data,
      params,
    });
  }
}
