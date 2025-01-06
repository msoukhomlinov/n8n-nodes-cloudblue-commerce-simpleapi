import type { IDataObject, ILoadOptionsFunctions, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IReport, IReportListResponse } from '../interfaces/IReport';
import type { IResource, IApiResponse } from '../interfaces';

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

    async loadOptions(
        loadOptionsFunctions: ILoadOptionsFunctions,
        propertyName: string,
        currentNodeParameters: Record<string, unknown>,
    ): Promise<INodePropertyOptions[]> {
        // This resource doesn't have any dynamic options
        return [];
    }

    async execute(
        executeFunctions: IExecuteFunctions,
        operation: string,
        i: number,
    ): Promise<IApiResponse<unknown>> {
        let result: IApiResponse<unknown>;

        switch (operation) {
            case 'list': {
                const returnAll = executeFunctions.getNodeParameter('returnAll', i) as boolean;
                const filters = executeFunctions.getNodeParameter('filters', i, {}) as IDataObject;
                
                if (returnAll) {
                    const reports = await this.getAllItems<IReport>(
                        executeFunctions,
                        'GET',
                        '',
                        undefined,
                        filters,
                    );
                    result = {
                        success: true,
                        data: { reports, total: reports.length },
                    };
                } else {
                    const limit = executeFunctions.getNodeParameter('limit', i) as number;
                    const reports = await this.getPagedItems<IReport>(
                        executeFunctions,
                        'GET',
                        '',
                        limit,
                        undefined,
                        filters,
                    );
                    result = {
                        success: true,
                        data: { reports, total: reports.length },
                    };
                }
                break;
            }
            case 'get': {
                const reportId = executeFunctions.getNodeParameter('reportId', i) as string;
                result = await this.makeApiRequest<IReport>(
                    executeFunctions,
                    'GET',
                    `/${reportId}`,
                );
                break;
            }
            case 'create': {
                const data = {
                    name: executeFunctions.getNodeParameter('name', i) as string,
                    type: executeFunctions.getNodeParameter('type', i) as string,
                    period: {
                        from: executeFunctions.getNodeParameter('periodFrom', i) as string,
                        to: executeFunctions.getNodeParameter('periodTo', i) as string,
                    },
                };
                result = await this.makeApiRequest<IReport>(
                    executeFunctions,
                    'POST',
                    '',
                    data,
                );
                break;
            }
            case 'delete': {
                const reportId = executeFunctions.getNodeParameter('reportId', i) as string;
                await this.makeApiRequest<void>(
                    executeFunctions,
                    'DELETE',
                    `/${reportId}`,
                );
                result = {
                    success: true,
                    data: { success: true },
                };
                break;
            }
            default:
                throw new Error(`Operation ${operation} is not supported`);
        }

        return result;
    }
} 