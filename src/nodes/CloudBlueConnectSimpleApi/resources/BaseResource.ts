import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  IHttpRequestMethods,
  JsonObject,
  INodePropertyOptions,
} from 'n8n-workflow';
import type { IResource, IPaginatedResponse, ITransformOptions } from '../interfaces';
import { CacheService } from '../utils/CacheService';
import { CloudBlueApiService } from '../services/CloudBlueApiService';
import { ResponseProcessingService } from '../services/ResponseProcessingService';
import { PaginationService } from '../services/PaginationService';
import { QueryParameterService } from '../services/QueryParameterService';

interface IHttpResponse extends IDataObject {
  headers?: {
    'x-correlation-id'?: string;
  };
}

export abstract class BaseResource {
  protected abstract basePath: string;
  protected abstract resource: IResource;
  private cacheService: CacheService | null = null;
  protected apiService: CloudBlueApiService;
  protected responseProcessingService: ResponseProcessingService;
  protected paginationService: PaginationService;
  protected queryParameterService: QueryParameterService;

  constructor() {
    this.apiService = CloudBlueApiService.getInstance();
    this.responseProcessingService = new ResponseProcessingService();
    this.paginationService = new PaginationService();
    this.queryParameterService = new QueryParameterService();
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

  protected async makeRequest<T>(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint = '',
    body?: IDataObject,
    qs?: IDataObject,
    headers: IDataObject = {},
    retryAttempt = 0,
    transformOptions?: ITransformOptions,
  ): Promise<IPaginatedResponse<T>> {
    await this.initializeServices(executeFunctions);

    try {
      // Only cache GET requests
      if (method === 'GET') {
        const cachedData = await this.cacheService?.get<IPaginatedResponse<T>>(
          method,
          `${this.basePath}${endpoint}`,
          body,
          qs,
        );

        if (cachedData) {
          return cachedData;
        }
      }

      const response = await this.apiService.makeRequest(
        executeFunctions,
        method,
        `${this.basePath}${endpoint}`,
        body,
        {
          ...qs,
          limit: qs?.limit || 10,
          offset: qs?.offset || 0,
        },
      );

      const processedResponse = this.responseProcessingService.processResponse<T>(response, {
        transformOptions,
        endpoint: `${this.basePath}${endpoint}`,
        method,
        correlationId: (response as unknown as IHttpResponse).headers?.['x-correlation-id'],
      });

      // Cache successful GET responses
      if (method === 'GET') {
        await this.cacheService?.set(
          method,
          `${this.basePath}${endpoint}`,
          body,
          qs,
          processedResponse as unknown as IDataObject,
        );
      }

      return processedResponse;
    } catch (error) {
      if (
        retryAttempt < ResponseProcessingService.MAX_RETRY_ATTEMPTS &&
        this.responseProcessingService.shouldRetry(error as JsonObject)
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, ResponseProcessingService.RETRY_DELAY_MS * 2 ** retryAttempt),
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

      this.responseProcessingService.handleError(error as JsonObject, executeFunctions, {
        endpoint: `${this.basePath}${endpoint}`,
        method,
        retryAttempt,
      });
    }
  }

  abstract execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IPaginatedResponse<unknown>>;

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
  ): Promise<IPaginatedResponse<T>> {
    return this.makeRequest(executeFunctions, method, endpoint, body, qs, headers);
  }
}
