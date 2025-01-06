import type { IDataObject, ILoadOptionsFunctions, IExecuteFunctions, INodePropertyOptions } from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IValidationRequest, IValidationResponse } from '../interfaces/IValidation';
import type { IResource, IApiResponse } from '../interfaces';

export class ValidationResource extends BaseResource {
    protected basePath = '/validation';
    protected resource: IResource = {
        name: 'Validation',
        value: 'validation',
        description: 'Validate product parameters in CloudBlue',
        operations: {
            validateParameters: {
                name: 'Validate Parameters',
                value: 'validateParameters',
                description: 'Validate product activation parameters',
                action: 'Validate product activation parameters',
                properties: [
                    {
                        displayName: 'Parameters',
                        name: 'parameters',
                        type: 'fixedCollection',
                        typeOptions: {
                            multipleValues: true,
                        },
                        default: {},
                        options: [
                            {
                                name: 'parameter',
                                displayName: 'Parameter',
                                values: [
                                    {
                                        displayName: 'ID',
                                        name: 'id',
                                        type: 'string',
                                        default: '',
                                        description: 'ID of the parameter',
                                        required: true,
                                    },
                                    {
                                        displayName: 'Name',
                                        name: 'name',
                                        type: 'string',
                                        default: '',
                                        description: 'Name of the parameter',
                                        required: true,
                                    },
                                    {
                                        displayName: 'Type',
                                        name: 'type',
                                        type: 'options',
                                        options: [
                                            {
                                                name: 'String',
                                                value: 'string',
                                            },
                                            {
                                                name: 'Integer',
                                                value: 'integer',
                                            },
                                            {
                                                name: 'Float',
                                                value: 'float',
                                            },
                                            {
                                                name: 'Boolean',
                                                value: 'boolean',
                                            },
                                            {
                                                name: 'Choice',
                                                value: 'choice',
                                            },
                                            {
                                                name: 'Email',
                                                value: 'email',
                                            },
                                            {
                                                name: 'Phone',
                                                value: 'phone',
                                            },
                                        ],
                                        default: 'string',
                                        description: 'Type of the parameter',
                                        required: true,
                                    },
                                    {
                                        displayName: 'Value',
                                        name: 'value',
                                        type: 'string',
                                        default: '',
                                        description: 'Value of the parameter',
                                        required: true,
                                    },
                                    {
                                        displayName: 'Required',
                                        name: 'required',
                                        type: 'boolean',
                                        default: false,
                                        description: 'Whether the parameter is required',
                                    },
                                    {
                                        displayName: 'Constraints',
                                        name: 'constraints',
                                        type: 'fixedCollection',
                                        typeOptions: {
                                            multipleValues: false,
                                        },
                                        default: {},
                                        options: [
                                            {
                                                name: 'constraint',
                                                displayName: 'Constraint',
                                                values: [
                                                    {
                                                        displayName: 'Hidden',
                                                        name: 'hidden',
                                                        type: 'boolean',
                                                        default: false,
                                                        description: 'Whether the parameter is hidden',
                                                    },
                                                    {
                                                        displayName: 'Readonly',
                                                        name: 'readonly',
                                                        type: 'boolean',
                                                        default: false,
                                                        description: 'Whether the parameter is readonly',
                                                    },
                                                    {
                                                        displayName: 'Choices',
                                                        name: 'choices',
                                                        type: 'string',
                                                        default: '',
                                                        description: 'Comma-separated list of choices',
                                                    },
                                                    {
                                                        displayName: 'Min Length',
                                                        name: 'minLength',
                                                        type: 'number',
                                                        default: 0,
                                                        description: 'Minimum length of the value',
                                                    },
                                                    {
                                                        displayName: 'Max Length',
                                                        name: 'maxLength',
                                                        type: 'number',
                                                        default: 0,
                                                        description: 'Maximum length of the value',
                                                    },
                                                    {
                                                        displayName: 'Pattern',
                                                        name: 'pattern',
                                                        type: 'string',
                                                        default: '',
                                                        description: 'Regular expression pattern',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
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
            case 'validateParameters': {
                const parametersCollection = executeFunctions.getNodeParameter('parameters', i) as {
                    parameter: Array<{
                        id: string;
                        name: string;
                        type: string;
                        value: string;
                        required: boolean;
                        constraints?: {
                            constraint: {
                                hidden?: boolean;
                                readonly?: boolean;
                                choices?: string;
                                minLength?: number;
                                maxLength?: number;
                                pattern?: string;
                            };
                        };
                    }>;
                };

                const parameters = parametersCollection.parameter.map(param => ({
                    id: param.id,
                    name: param.name,
                    type: param.type,
                    value: param.value,
                    required: param.required,
                    constraints: param.constraints ? {
                        hidden: param.constraints.constraint.hidden,
                        readonly: param.constraints.constraint.readonly,
                        choices: param.constraints.constraint.choices?.split(',').map(c => c.trim()),
                        minLength: param.constraints.constraint.minLength,
                        maxLength: param.constraints.constraint.maxLength,
                        pattern: param.constraints.constraint.pattern,
                    } : undefined,
                }));

                const validationRequest: IValidationRequest = {
                    parameters,
                };

                result = await this.makeApiRequest<IValidationResponse>(
                    executeFunctions,
                    'POST',
                    '/parameters',
                    validationRequest as unknown as IDataObject,
                );
                break;
            }
            default:
                throw new Error(`Operation ${operation} is not supported`);
        }

        return result;
    }
} 