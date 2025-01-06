import type { 
    INodeProperties, 
    IDataObject, 
    INodePropertyOptions,
    INodePropertyCollection 
} from 'n8n-workflow';

export class ValidationError extends Error {
    constructor(message: string, public details: Record<string, string[]> = {}) {
        super(message);
        this.name = 'ValidationError';
    }
}

function validateRequired(value: unknown, fieldName: string): void {
    if (value === undefined || value === null || value === '') {
        throw new ValidationError(`Field ${fieldName} is required`);
    }
}

function validateType(value: unknown, expectedType: string, fieldName: string): void {
    if (value === undefined || value === null) {
        return;
    }
    
    if (expectedType === 'array' && !Array.isArray(value)) {
        throw new ValidationError(`Field ${fieldName} must be an array`);
    }
    
    const type = typeof value;
    if (expectedType !== 'array' && type !== expectedType) {
        throw new ValidationError(`Field ${fieldName} must be of type ${expectedType}`);
    }
}

function validateEnum(value: unknown, options: string[], fieldName: string): void {
    if (value !== undefined && value !== null && !options.includes(value as string)) {
        throw new ValidationError(
            `Field ${fieldName} must be one of: ${options.join(', ')}`,
        );
    }
}

function validatePattern(
    value: unknown,
    pattern: string,
    flags: string | undefined,
    fieldName: string,
): void {
    if (value === undefined || value === null || value === '') {
        return;
    }

    const regex = new RegExp(pattern, flags);
    if (!regex.test(String(value))) {
        throw new ValidationError(
            `Field ${fieldName} has invalid format`,
        );
    }
}

function validateLength(
    value: unknown,
    min: number | undefined,
    max: number | undefined,
    fieldName: string,
): void {
    if (value === undefined || value === null) {
        return;
    }

    const length = String(value).length;

    if (min !== undefined && length < min) {
        throw new ValidationError(
            `Field ${fieldName} must be at least ${min} characters long`,
        );
    }

    if (max !== undefined && length > max) {
        throw new ValidationError(
            `Field ${fieldName} must not exceed ${max} characters`,
        );
    }
}

function validateDependentFields(
    data: IDataObject,
    field: INodeProperties,
    fieldName: string,
): void {
    if (!field.displayOptions) {
        return;
    }

    const { show, hide } = field.displayOptions;

    if (show) {
        for (const [dependentField, requiredValues] of Object.entries(show)) {
            const currentValue = data[dependentField]?.toString();
            if (Array.isArray(requiredValues) && currentValue && !requiredValues.includes(currentValue)) {
                throw new ValidationError(
                    `Field ${fieldName} requires ${dependentField} to be one of: ${requiredValues.join(', ')}`,
                );
            }
        }
    }

    if (hide) {
        for (const [dependentField, hideValues] of Object.entries(hide)) {
            const currentValue = data[dependentField]?.toString();
            if (Array.isArray(hideValues) && currentValue && hideValues.includes(currentValue) && data[field.name] !== undefined) {
                throw new ValidationError(
                    `Field ${fieldName} cannot be set when ${dependentField} is one of: ${hideValues.join(', ')}`,
                );
            }
        }
    }
}

function validateNumberRange(
    value: unknown,
    min: number | undefined,
    max: number | undefined,
    fieldName: string,
): void {
    if (value === undefined || value === null) {
        return;
    }

    const numValue = Number(value);

    if (Number.isNaN(numValue)) {
        throw new ValidationError(`Field ${fieldName} must be a valid number`);
    }

    if (min !== undefined && numValue < min) {
        throw new ValidationError(
            `Field ${fieldName} must be greater than or equal to ${min}`,
        );
    }

    if (max !== undefined && numValue > max) {
        throw new ValidationError(
            `Field ${fieldName} must be less than or equal to ${max}`,
        );
    }
}

export function validateField(
    value: unknown,
    property: INodeProperties,
    fieldName: string,
    data: IDataObject,
): void {
    // Check required fields
    if (property.required) {
        validateRequired(value, fieldName);
    }

    // Skip further validation if value is not provided and field is not required
    if (value === undefined || value === null) {
        return;
    }

    // Validate type
    if (property.type) {
        validateType(value, property.type, fieldName);
    }

    // Validate enum values
    if ('options' in property && Array.isArray(property.options)) {
        const options = property.options
            .filter((opt): opt is INodePropertyOptions => 'value' in opt)
            .map(opt => opt.value.toString());
        validateEnum(value, options, fieldName);
    }

    // Validate pattern if specified
    if (property.typeOptions?.validationPattern) {
        validatePattern(
            value,
            property.typeOptions.validationPattern,
            property.typeOptions.validationPatternFlags,
            fieldName,
        );
    }

    // Validate string length
    if (property.type === 'string' && property.typeOptions) {
        const { minLength, maxLength } = property.typeOptions;
        validateLength(value, minLength, maxLength, fieldName);
    }

    // Validate number range
    if (property.type === 'number' && property.typeOptions) {
        const { minValue, maxValue } = property.typeOptions;
        validateNumberRange(value, minValue, maxValue, fieldName);
    }

    // Validate dependent fields
    validateDependentFields(data, property, fieldName);
}

export function validateResourceData(
    data: IDataObject,
    properties: INodeProperties[],
): void {
    const errors: Record<string, string[]> = {};

    for (const property of properties) {
        try {
            validateField(
                data[property.name],
                property,
                property.displayName || property.name,
                data,
            );
        } catch (error) {
            if (error instanceof ValidationError) {
                errors[property.name] = [error.message];
            }
        }
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }
} 