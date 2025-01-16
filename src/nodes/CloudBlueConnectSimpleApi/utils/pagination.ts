/**
 * @file Pagination Handler
 * @description Common pagination logic for handling paginated API responses.
 * Implements automatic pagination for requests exceeding the API limit.
 *
 * @module CloudBlueConnectSimpleApi/utils/pagination
 */

import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import type { CloudBlueApiService } from '../services/CloudBlueApiService';
import type { IListResponse } from '../interfaces/api';
import { PAGINATION } from './constants';
import { debugLog } from './debug';

/**
 * Makes a single paginated request
 */
async function makeRequest<T>(
  apiService: CloudBlueApiService,
  endpoint: string,
  params: IDataObject,
  offset: number,
  limit: number,
): Promise<{ data?: IListResponse<T> }> {
  return await apiService.request<IListResponse<T>>({
    method: 'GET',
    url: endpoint,
    params: {
      ...params,
      offset,
      limit,
    },
  });
}

/**
 * Handles paginated requests, automatically managing multiple requests if needed
 * @param executeFunctions n8n execute functions
 * @param apiService CloudBlue API service instance
 * @param endpoint API endpoint to call
 * @param i Item index
 * @param params Additional request parameters
 * @returns Array of results
 */
export async function getMany<T extends IDataObject>(
  executeFunctions: IExecuteFunctions,
  apiService: CloudBlueApiService,
  endpoint: string,
  i: number,
  params: IDataObject = {},
): Promise<T[]> {
  const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
  const userLimit = executeFunctions.getNodeParameter(
    'limit',
    i,
    PAGINATION.DEFAULT_LIMIT,
  ) as number;
  const initialLimit = Math.min(userLimit, PAGINATION.MAX_LIMIT);

  // First request to get initial data and total count
  const firstPageResponse = await makeRequest<T>(apiService, endpoint, params, 0, initialLimit);

  let results = firstPageResponse.data?.data || [];

  // If we need more records
  if ((returnAll || userLimit > results.length) && firstPageResponse.data?.pagination) {
    const totalAvailable = firstPageResponse.data.pagination.total;
    const targetCount = returnAll ? totalAvailable : Math.min(userLimit, totalAvailable);

    // Continue fetching if we need more records and more are available
    while (results.length < targetCount && results.length < totalAvailable) {
      const nextOffset = results.length;
      const nextLimit = Math.min(PAGINATION.MAX_LIMIT, targetCount - results.length);

      debugLog('API_REQUEST', 'Fetching next page', { nextOffset, nextLimit, total: targetCount });

      const nextPage = await makeRequest<T>(apiService, endpoint, params, nextOffset, nextLimit);
      if (!nextPage.data?.data?.length) break; // No more data

      results = results.concat(nextPage.data.data);
    }
  }

  // Trim to exact requested limit if needed
  if (!returnAll && userLimit && results.length > userLimit) {
    results = results.slice(0, userLimit);
  }

  return results;
}
