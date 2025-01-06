import { NodeApiError } from 'n8n-workflow';
import type {
    IExecuteFunctions,
    ILoadOptionsFunctions,
    IDataObject,
    IHttpRequestMethods,
    IHttpRequestOptions,
    JsonObject,
    INodePropertyOptions,
} from 'n8n-workflow';
import type { 
    IResource, 
    IApiResponse, 
    ITransformOptions 
} from '../interfaces';
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

    protected async initializeCache(executeFunctions: IExecuteFunctions | ILoadOptionsFunctions): Promise<void> {
        if (this.cacheService) {
            return;
        }

        const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');
        this.cacheService = new CacheService({
            enabled: credentials.enableCache as boolean,
            ttl: credentials.cacheTTL as number,
            size: credentials.cacheSize as number,
        });
    }

    private async getToken(executeFunctions: IExecuteFunctions | ILoadOptionsFunctions): Promise<string> {
        // Check if we have a valid token
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        const credentials = await executeFunctions.getCredentials('cloudBlueConnectSimpleApi');
        
        const options: IHttpRequestOptions = {
            method: 'POST',
            url: `${(credentials.apiUrl as string).replace(/\/$/, '')}/auth/token`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
                'X-Subscription-Key': credentials.subscriptionKey,
            },
        };

        try {
            const response = await executeFunctions.helpers.httpRequest(options);
            const data = response as unknown as ITokenResponse;
            if (!data || !data.token) {
                throw new Error('Invalid token response');
            }

            this.token = data.token;
            // Token is valid for 1500s (25 min) as per API docs
            this.tokenExpiry = Date.now() + 1500000 - 30000; // 1500s in ms, minus 30s buffer

            return this.token;
        } catch (error) {
            const errorDetails = mapError(error as JsonObject);
            throw new NodeApiError(executeFunctions.getNode(), error as JsonObject, errorDetails);
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
        await this.initializeCache(executeFunctions);

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

        const options: IHttpRequestOptions = {
            method,
            url: '',
            body,
            qs: {
                ...qs,
                limit: qs?.limit || 10,
                offset: qs?.offset || 0,
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Subscription-Key': credentials.subscriptionKey,
                ...headers,
            },
        };

        const baseUrl = (credentials.apiUrl as string).replace(/\/$/, '');
        options.url = `${baseUrl}${this.basePath}${endpoint}`;

        try {
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
            if (apiError.response) {
                const statusCode = Number.parseInt((apiError.response as JsonObject).status?.toString() || '500', 10);
                
                // Handle token refresh for 401 errors
                if (statusCode === 401 && retryAttempt === 0) {
                    try {
                        // Force token refresh
                        this.token = null;
                        this.tokenExpiry = null;
                        const newToken = await this.getToken(executeFunctions);
                        // Retry the request with new token
                        const updatedHeaders = {
                            ...options.headers || {},
                            Authorization: `Bearer ${newToken}`,
                        };
                        return this.makeRequest(
                            executeFunctions,
                            method,
                            endpoint,
                            body,
                            qs,
                            updatedHeaders,
                            retryAttempt + 1,
                            transformOptions,
                        );
                    } catch (refreshError) {
                        const errorDetails = mapError(refreshError as JsonObject);
                        throw new NodeApiError(executeFunctions.getNode(), refreshError as JsonObject, errorDetails);
                    }
                }

                const errorDetails = mapError(error as JsonObject);
                throw new NodeApiError(executeFunctions.getNode(), error as JsonObject, errorDetails);
            }
            throw error;
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
                transformed = transformed.map(item => 
                    this.selectFields(item as Record<string, unknown>, options.select as string[])
                );
            } else {
                transformed = this.selectFields(transformed as Record<string, unknown>, options.select);
            }
        }

        // Apply field renaming
        if (options.rename) {
            if (Array.isArray(transformed)) {
                transformed = transformed.map(item => 
                    this.renameFields(item as Record<string, unknown>, options.rename as Record<string, string>)
                );
            } else {
                transformed = this.renameFields(transformed as Record<string, unknown>, options.rename);
            }
        }

        // Apply field transformations
        if (options.transform) {
            if (Array.isArray(transformed)) {
                transformed = transformed.map(item => 
                    this.transformFields(item as Record<string, unknown>, options.transform as Record<string, (value: unknown) => unknown>)
                );
            } else {
                transformed = this.transformFields(transformed as Record<string, unknown>, options.transform);
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

    private renameFields(data: Record<string, unknown>, renames: Record<string, string>): Record<string, unknown> {
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