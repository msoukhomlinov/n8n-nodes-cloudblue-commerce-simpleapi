import type {
  IDataObject,
  ILoadOptionsFunctions,
  IExecuteFunctions,
  INodePropertyOptions,
} from 'n8n-workflow';
import { BaseResource } from './BaseResource';
import type { IValidationRequest, IValidationResponse } from '../interfaces/IValidation';
import type { IResource, IPaginatedResponse } from '../interfaces';

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
  ): Promise<IPaginatedResponse<unknown>> {
    switch (operation) {
      case 'validate': {
        const data = this.queryParameterService.buildQueryParameters(executeFunctions, i, [
          {
            name: 'type',
            type: 'string',
            required: true,
          },
          {
            name: 'data',
            type: 'string',
            required: true,
          },
        ]);

        return this.makeRequest<IValidationResponse>(executeFunctions, 'POST', '', data);
      }

      default:
        throw new Error(`Operation ${operation} not found`);
    }
  }
}
