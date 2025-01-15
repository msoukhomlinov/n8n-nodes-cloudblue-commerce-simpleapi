import 'reflect-metadata';
import type { ITypeDefinition, IPropertyDefinition } from './types';

export namespace TypeValidator {
  const METADATA_KEY = 'type-validator:schema';

  export const validateValue = async (value: unknown, type: ITypeDefinition): Promise<boolean> => {
    switch (type.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  };

  export const validateObject = async (
    obj: unknown,
    schema: Record<string, IPropertyDefinition>,
  ): Promise<boolean> => {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const [key, def] of Object.entries(schema)) {
      const value = (obj as Record<string, unknown>)[key];

      if (def.required && value === undefined) {
        return false;
      }

      if (value !== undefined && !(await validateValue(value, def.type))) {
        return false;
      }
    }

    return true;
  };

  export const getTypeMetadata = (
    target: object,
    propertyKey: string,
  ): IPropertyDefinition | undefined => {
    return Reflect.getMetadata(METADATA_KEY, target, propertyKey) as
      | IPropertyDefinition
      | undefined;
  };

  export const setTypeMetadata = (
    target: object,
    propertyKey: string,
    metadata: IPropertyDefinition,
  ): void => {
    Reflect.defineMetadata(METADATA_KEY, metadata, target, propertyKey);
  };
}

// Decorator factory for type validation
export const ValidateType = (type: ITypeDefinition, required = true): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol): void => {
    TypeValidator.setTypeMetadata(target, propertyKey.toString(), {
      type,
      required,
    });
  };
};
