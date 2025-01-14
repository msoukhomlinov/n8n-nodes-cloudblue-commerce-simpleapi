import type {
  IDataObject,
  ILoadOptionsFunctions,
  IExecuteFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IReport, IReportListResponse } from '../interfaces/IReport';
import type { IResource, IPaginatedResponse } from '../interfaces';

export class ReportResource extends BaseResource {
  protected basePath = '/reports';
  protected resource: IResource = {
    name: 'Report',
    value: 'report',
    description: 'Manage reports in CloudBlue',
    operations: {
      list: {
        name: 'List',
        value: 'list',
        description: 'List all reports',
        action: 'List all reports',
        properties: [
          {
            displayName: 'Return All',
            name: 'returnAll',
            type: 'boolean',
            default: false,
            description: 'Whether to return all results or only up to a given limit',
          },
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            typeOptions: {
              minValue: 1,
            },
            default: 10,
            description: 'Max number of results to return',
            displayOptions: {
              show: {
                returnAll: [false],
              },
            },
          },
        ],
      },
      get: {
        name: 'Get',
        value: 'get',
        description: 'Get a specific report',
        action: 'Get a specific report',
        properties: [
          {
            displayName: 'Report ID',
            name: 'reportId',
            type: 'string',
            required: true,
            default: '',
            description: 'ID of the report to retrieve',
          },
        ],
      },
      create: {
        name: 'Create',
        value: 'create',
        description: 'Create a new report',
        action: 'Create a new report',
        properties: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            required: true,
            default: '',
            description: 'Name of the report',
          },
          {
            displayName: 'Type',
            name: 'type',
            type: 'string',
            required: true,
            default: '',
            description: 'Type of the report',
          },
          {
            displayName: 'Period From',
            name: 'periodFrom',
            type: 'dateTime',
            required: true,
            default: '',
            description: 'Start date of the report period (ISO 8601)',
          },
          {
            displayName: 'Period To',
            name: 'periodTo',
            type: 'dateTime',
            required: true,
            default: '',
            description: 'End date of the report period (ISO 8601)',
          },
        ],
      },
      delete: {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a report',
        action: 'Delete a report',
        properties: [
          {
            displayName: 'Report ID',
            name: 'reportId',
            type: 'string',
            required: true,
            default: '',
            description: 'ID of the report to delete',
          },
        ],
      },
    },
    properties: [],
  };

  async execute(
    executeFunctions: IExecuteFunctions,
    operation: string,
    i: number,
  ): Promise<IPaginatedResponse<unknown>> {
    switch (operation) {
      case 'list': {
        const paginationParams = this.queryParameterService.extractPaginationParameters(
          executeFunctions,
          i,
        );

        const filterParams = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'filters',
            type: 'string',
          },
        ]);

        if (paginationParams.returnAll) {
          const reports = await this.paginationService.getPaginatedResults<IReport>(
            this.apiService,
            executeFunctions,
            this.basePath,
            {
              returnAll: true,
              additionalParams: filterParams,
            },
          );

          return {
            data: reports,
            pagination: {
              offset: 0,
              limit: reports.length,
              total: reports.length,
            },
          };
        }

        return this.makeRequest<IReport>(executeFunctions, 'GET', '', undefined, {
          ...filterParams,
          limit: paginationParams.limit,
          offset: paginationParams.offset,
        });
      }

      case 'get': {
        const id = executeFunctions.getNodeParameter('reportId', i) as string;
        return this.makeRequest<IReport>(executeFunctions, 'GET', `/${id}`);
      }

      case 'create': {
        const params = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            name: 'type',
            type: 'string',
            required: true,
          },
          {
            name: 'periodFrom',
            type: 'dateTime',
            required: true,
          },
          {
            name: 'periodTo',
            type: 'dateTime',
            required: true,
          },
        ]);

        return this.makeRequest<IReport>(executeFunctions, 'POST', '', params);
      }

      case 'delete': {
        const id = executeFunctions.getNodeParameter('reportId', i) as string;
        return this.makeRequest<void>(executeFunctions, 'DELETE', `/${id}`);
      }

      default:
        throw new Error(`Operation ${operation} not found`);
    }
  }

  async loadOptions(
    loadOptionsFunctions: ILoadOptionsFunctions,
    propertyName: string,
    currentNodeParameters: Record<string, unknown>,
  ): Promise<INodePropertyOptions[]> {
    return [];
  }
}
