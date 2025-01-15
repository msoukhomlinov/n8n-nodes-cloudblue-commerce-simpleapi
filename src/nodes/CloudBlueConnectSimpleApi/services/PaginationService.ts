import type { IExecuteFunctions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import type { IApiResponse } from '../interfaces';
import type { CloudBlueApiService } from './CloudBlueApiService';
import { PAGINATION } from '../utils/constants';

interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export class PaginationService {
  public async getPaginatedResults<T>(
    apiService: CloudBlueApiService,
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    endpoint: string,
    options: {
      returnAll: boolean;
      limit?: number;
      offset?: number;
      additionalParams?: IDataObject;
    },
  ): Promise<T[]> {
    const returnData: T[] = [];
    const query: IDataObject = { ...options.additionalParams };
    let responseData: IPaginatedResponse<T>;

    // Enforce limit constraints
    query.limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    query.offset = options.offset || 0;
    let currentOffset = Number(query.offset);

    do {
      const response = await apiService.request<IPaginatedResponse<T>>({
        method: 'GET',
        url: endpoint,
        params: { ...query, offset: currentOffset },
      });

      if (!response.data) {
        throw new Error('Failed to fetch paginated data');
      }

      responseData = response.data;
      if (Array.isArray(responseData.data)) {
        returnData.push(...responseData.data);
      }

      if (!options.returnAll) {
        break;
      }

      currentOffset += Number(query.limit);
      if (currentOffset >= responseData.pagination.total) {
        break;
      }
    } while (currentOffset < responseData.pagination.total);

    return returnData;
  }
}
