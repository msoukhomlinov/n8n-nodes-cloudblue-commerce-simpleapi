import 'reflect-metadata';
import type { ITypeDefinition, IPropertyDefinition } from './types';
import { TypeValidator } from './TypeValidator';

const VALIDATORS_KEY = 'type-decorators:validators';

export function Required(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const type = TypeValidator.getTypeMetadata(target, propertyKey.toString());
    if (type) {
      TypeValidator.setTypeMetadata(target, propertyKey.toString(), {
        ...type,
        required: true,
      });
    }
  };
}

export function Optional(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const type = TypeValidator.getTypeMetadata(target, propertyKey.toString());
    if (type) {
      TypeValidator.setTypeMetadata(target, propertyKey.toString(), {
        ...type,
        required: false,
      });
    }
  };
}

export function Validate(
  validator: (value: unknown) => boolean | Promise<boolean>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const validators =
      (Reflect.getMetadata(VALIDATORS_KEY, target, propertyKey.toString()) as Array<
        (value: unknown) => boolean | Promise<boolean>
      >) || [];
    validators.push(validator);
    Reflect.defineMetadata(VALIDATORS_KEY, validators, target, propertyKey.toString());
  };
}

export function Type(type: ITypeDefinition): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    TypeValidator.setTypeMetadata(target, propertyKey.toString(), {
      type,
      required: false,
    });
  };
}

export async function validateObject(obj: object): Promise<boolean> {
  try {
    await validateObjectProperties(obj);
    return true;
  } catch {
    return false;
  }
}

async function validateObjectProperties(obj: object): Promise<void> {
  const properties = Object.getOwnPropertyNames(obj);
  const validationPromises: Promise<boolean>[] = [];

  for (const propertyKey of properties) {
    const type = TypeValidator.getTypeMetadata(obj, propertyKey);
    if (type) {
      validationPromises.push(
        TypeValidator.validateValue(obj[propertyKey as keyof typeof obj], type.type),
      );
    }

    const validators =
      (Reflect.getMetadata(VALIDATORS_KEY, obj, propertyKey) as Array<
        (value: unknown) => boolean | Promise<boolean>
      >) || [];
    for (const validator of validators) {
      validationPromises.push(Promise.resolve(validator(obj[propertyKey as keyof typeof obj])));
    }
  }

  const results = await Promise.all(validationPromises);
  if (results.some((result) => !result)) {
    throw new Error('Object validation failed');
  }
}
