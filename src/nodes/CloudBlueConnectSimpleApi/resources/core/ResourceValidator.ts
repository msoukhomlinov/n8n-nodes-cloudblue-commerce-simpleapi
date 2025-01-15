export interface IValidationRule {
  validate(data: unknown): Promise<boolean>;
  message: string;
}

export interface IValidationContext {
  resourceName: string;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
}

export interface IValidationTarget {
  [key: string]: unknown;
}

export class ResourceValidator {
  private rules: IValidationRule[];
  private errors: string[];

  constructor(rules: IValidationRule[] = []) {
    this.rules = rules;
    this.errors = [];
  }

  public addRule(rule: IValidationRule): void {
    this.rules.push(rule);
  }

  public async validate(context: IValidationContext): Promise<boolean> {
    this.errors = [];
    let isValid = true;

    for (const rule of this.rules) {
      try {
        const ruleValid = await rule.validate(context.data);
        if (!ruleValid) {
          this.errors.push(rule.message);
          isValid = false;
        }
      } catch (error) {
        if (error instanceof Error) {
          this.errors.push(error.message);
        } else {
          this.errors.push('Unknown validation error occurred');
        }
        isValid = false;
      }
    }

    return isValid;
  }

  public getErrors(): string[] {
    return [...this.errors];
  }
}

export class ValidationRuleBuilder {
  private rules: IValidationRule[];

  constructor() {
    this.rules = [];
  }

  public required(field: string): this {
    this.rules.push({
      validate: async (data: unknown) => {
        const target = data as IValidationTarget;
        if (typeof target !== 'object' || target === null) return false;
        return Object.prototype.hasOwnProperty.call(target, field) && target[field] !== undefined;
      },
      message: `Field '${field}' is required`,
    });
    return this;
  }

  public type(field: string, expectedType: 'string' | 'number' | 'boolean' | 'object'): this {
    this.rules.push({
      validate: async (data: unknown) => {
        const target = data as IValidationTarget;
        if (typeof target !== 'object' || target === null) return false;
        const value = target[field];
        switch (expectedType) {
          case 'string':
            return typeof value === 'string';
          case 'number':
            return typeof value === 'number';
          case 'boolean':
            return typeof value === 'boolean';
          case 'object':
            return typeof value === 'object';
          default:
            return false;
        }
      },
      message: `Field '${field}' must be of type ${expectedType}`,
    });
    return this;
  }

  public pattern(field: string, regex: RegExp): this {
    this.rules.push({
      validate: async (data: unknown) => {
        const target = data as IValidationTarget;
        if (typeof target !== 'object' || target === null) return false;
        const value = target[field];
        return typeof value === 'string' && regex.test(value);
      },
      message: `Field '${field}' must match pattern ${regex}`,
    });
    return this;
  }

  public custom(validator: (data: unknown) => Promise<boolean>, message: string): this {
    this.rules.push({
      validate: validator,
      message,
    });
    return this;
  }

  public build(): ResourceValidator {
    return new ResourceValidator(this.rules);
  }
}
