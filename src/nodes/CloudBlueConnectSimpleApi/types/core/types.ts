export interface ITypeDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  properties?: Record<string, IPropertyDefinition>; // For object types
  items?: ITypeDefinition; // For array types
}

export interface IPropertyDefinition {
  type: ITypeDefinition;
  required: boolean;
  description?: string;
}

export interface IValidationResult {
  valid: boolean;
  errors: IValidationError[];
}

export interface IValidationError {
  path: string[];
  message: string;
  code: ValidationErrorCode;
}

export enum ValidationErrorCode {
  REQUIRED = 'required',
  TYPE_MISMATCH = 'type_mismatch',
  PATTERN_MISMATCH = 'pattern_mismatch',
  ENUM_MISMATCH = 'enum_mismatch',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  CUSTOM = 'custom',
}
