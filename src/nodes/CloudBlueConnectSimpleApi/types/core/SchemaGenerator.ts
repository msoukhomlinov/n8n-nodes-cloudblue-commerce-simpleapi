import type { ITypeDefinition, IPropertyDefinition } from './types';

export namespace SchemaGenerator {
  export interface ISchemaDefinition {
    type: string;
    properties?: Record<string, ISchemaPropertyDefinition>;
    items?: ISchemaDefinition;
    required?: string[];
  }

  export interface ISchemaPropertyDefinition {
    type: string;
    description?: string;
    properties?: Record<string, ISchemaPropertyDefinition>;
    items?: ISchemaDefinition;
  }

  export const generateJsonSchema = (type: ITypeDefinition): ISchemaDefinition => {
    const baseSchema: ISchemaDefinition = {
      type: type.type,
    };

    if (type.type === 'object' && type.properties) {
      const properties: Record<string, ISchemaPropertyDefinition> = {};
      const required: string[] = [];

      for (const [key, propDef] of Object.entries(type.properties)) {
        properties[key] = generatePropertySchema(propDef);
        if (propDef.required) {
          required.push(key);
        }
      }

      return {
        ...baseSchema,
        properties,
        ...(required.length > 0 ? { required } : {}),
      };
    }

    if (type.type === 'array' && type.items) {
      return {
        ...baseSchema,
        items: generateJsonSchema(type.items),
      };
    }

    return baseSchema;
  };

  const generatePropertySchema = (propDef: IPropertyDefinition): ISchemaPropertyDefinition => {
    const schema: ISchemaPropertyDefinition = {
      type: propDef.type.type,
    };

    if (propDef.description) {
      schema.description = propDef.description;
    }

    if (propDef.type.type === 'object' && propDef.type.properties) {
      schema.properties = {};
      for (const [key, subPropDef] of Object.entries(propDef.type.properties)) {
        schema.properties[key] = generatePropertySchema(subPropDef);
      }
    }

    if (propDef.type.type === 'array' && propDef.type.items) {
      schema.items = generateJsonSchema(propDef.type.items);
    }

    return schema;
  };

  export const generateMarkdownDocs = (type: ITypeDefinition, name: string): string => {
    let docs = `# ${name}\n\n`;

    if (type.type === 'object' && type.properties) {
      docs += '## Properties\n\n';
      docs += '| Name | Type | Required | Description |\n';
      docs += '|------|------|----------|-------------|\n';

      for (const [key, propDef] of Object.entries(type.properties)) {
        docs += `| ${key} | ${getTypeString(propDef.type)} | ${propDef.required ? 'Yes' : 'No'} | ${
          propDef.description || '-'
        } |\n`;
      }
    }

    return docs;
  };

  const getTypeString = (type: ITypeDefinition): string => {
    switch (type.type) {
      case 'array':
        return `Array<${type.items ? getTypeString(type.items) : 'any'}>`;
      case 'object':
        return 'Object';
      default:
        return type.type;
    }
  };
}
