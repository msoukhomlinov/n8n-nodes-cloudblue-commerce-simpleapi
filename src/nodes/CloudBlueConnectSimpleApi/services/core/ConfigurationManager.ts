import type { IServiceConfig } from './ServiceRegistry';

export interface IConfigSchema {
  type: 'string' | 'number' | 'boolean' | 'object';
  required?: boolean;
  default?: unknown;
  validation?: (value: unknown) => boolean;
}

export interface IServiceSchema {
  [key: string]: IConfigSchema;
}

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private configurations: Map<string, Record<string, unknown>>;
  private schemas: Map<string, IServiceSchema>;

  private constructor() {
    this.configurations = new Map();
    this.schemas = new Map();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public registerSchema(serviceName: string, schema: IServiceSchema): void {
    this.schemas.set(serviceName, schema);
  }

  public setConfiguration(serviceConfig: IServiceConfig): void {
    const { name, config = {} } = serviceConfig;
    const schema = this.schemas.get(name);

    if (schema) {
      const validatedConfig = this.validateConfiguration(config, schema);
      this.configurations.set(name, validatedConfig);
    } else {
      // If no schema is registered, store config as-is
      this.configurations.set(name, config);
    }
  }

  private validateConfiguration(
    config: Record<string, unknown>,
    schema: IServiceSchema,
  ): Record<string, unknown> {
    const validatedConfig: Record<string, unknown> = {};

    // Process each field in the schema
    for (const [key, schemaField] of Object.entries(schema)) {
      const value = config[key];

      // Check required fields
      if (schemaField.required && value === undefined && schemaField.default === undefined) {
        throw new Error(`Required configuration field '${key}' is missing`);
      }

      // Use default value if value is not provided
      if (value === undefined && schemaField.default !== undefined) {
        validatedConfig[key] = schemaField.default;
        continue;
      }

      // Validate type
      if (value !== undefined) {
        const isValidType = (val: unknown, type: string): boolean => {
          switch (type) {
            case 'string':
              return typeof val === 'string';
            case 'number':
              return typeof val === 'number';
            case 'boolean':
              return typeof val === 'boolean';
            case 'object':
              return typeof val === 'object';
            default:
              return false;
          }
        };

        if (!isValidType(value, schemaField.type)) {
          throw new Error(
            `Invalid type for configuration field '${key}'. Expected ${
              schemaField.type
            }, got ${typeof value}`,
          );
        }
      }

      // Run custom validation if provided
      if (schemaField.validation && value !== undefined && !schemaField.validation(value)) {
        throw new Error(`Validation failed for configuration field '${key}'`);
      }

      // Store validated value
      validatedConfig[key] = value ?? schemaField.default;
    }

    return validatedConfig;
  }

  public getConfiguration<T = Record<string, unknown>>(serviceName: string): T {
    const config = this.configurations.get(serviceName);
    if (!config) {
      throw new Error(`Configuration not found for service: ${serviceName}`);
    }
    return config as T;
  }

  public updateConfiguration(
    serviceName: string,
    updates: Record<string, unknown>,
  ): Record<string, unknown> {
    const currentConfig = this.configurations.get(serviceName) ?? {};
    const schema = this.schemas.get(serviceName);

    const newConfig = {
      ...currentConfig,
      ...updates,
    };

    if (schema) {
      const validatedConfig = this.validateConfiguration(newConfig, schema);
      this.configurations.set(serviceName, validatedConfig);
      return validatedConfig;
    }

    this.configurations.set(serviceName, newConfig);
    return newConfig;
  }

  public hasConfiguration(serviceName: string): boolean {
    return this.configurations.has(serviceName);
  }

  public deleteConfiguration(serviceName: string): void {
    this.configurations.delete(serviceName);
    this.schemas.delete(serviceName);
  }
}
