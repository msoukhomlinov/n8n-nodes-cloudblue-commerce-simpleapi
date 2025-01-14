import type { IExecuteFunctions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { PAGINATION } from '../utils/constants';

interface IParameterDefinition {
  name: string;
  type: string;
  required?: boolean;
  default?: unknown;
}

export class QueryParameterService {
  public buildQueryParameters(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    i: number,
    parameterDefinitions: IParameterDefinition[],
  ): IDataObject {
    const query: IDataObject = {};

    for (const param of parameterDefinitions) {
      const value = executeFunctions.getNodeParameter(param.name, i, param.default) as unknown;

      // Skip empty optional parameters
      if (!param.required && (value === undefined || value === '')) {
        continue;
      }

      // Handle different parameter types
      switch (param.type) {
        case 'dateTime':
          if (value) {
            query[param.name] = value;
          }
          break;

        case 'number':
          if (value !== undefined && value !== '') {
            query[param.name] = Number(value);
          }
          break;

        case 'boolean':
          if (value !== undefined) {
            query[param.name] = Boolean(value);
          }
          break;

        default:
          if (value !== undefined && value !== '') {
            query[param.name] = value;
          }
      }
    }

    return query;
  }

  public extractPaginationParameters(
    executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
    i: number,
  ): { returnAll: boolean; limit: number; offset: number } {
    const returnAll = executeFunctions.getNodeParameter('returnAll', i, false) as boolean;
    const params: { returnAll: boolean; limit: number; offset: number } = {
      returnAll,
      limit: PAGINATION.DEFAULT_LIMIT,
      offset: executeFunctions.getNodeParameter('offset', i, 0) as number,
    };

    if (!returnAll) {
      const requestedLimit = executeFunctions.getNodeParameter(
        'limit',
        i,
        PAGINATION.DEFAULT_LIMIT,
      ) as number;
      params.limit = Math.min(requestedLimit, PAGINATION.MAX_LIMIT);
    } else {
      params.limit = PAGINATION.MAX_LIMIT;
    }

    return params;
  }
}
