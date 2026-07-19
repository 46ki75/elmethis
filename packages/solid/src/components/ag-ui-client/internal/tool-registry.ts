import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type ToolParameters = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
};

export interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => unknown;
}

export interface JsonSchemaToolDef {
  description: string;
  jsonSchema: ToolParameters;
  execute: (args: Record<string, unknown>) => unknown;
}

export type AnyToolDef =
  ToolDef<z.ZodObject<z.ZodRawShape>> | JsonSchemaToolDef;
export type ToolRegistry = Record<string, AnyToolDef>;

export function defineTool<T extends z.ZodObject<z.ZodRawShape>>(
  tool: ToolDef<T>,
): AnyToolDef {
  return tool as unknown as AnyToolDef;
}

export function defineJsonSchemaTool(tool: JsonSchemaToolDef): AnyToolDef {
  return tool;
}

export function getToolDefinitions(registry: ToolRegistry) {
  return Object.entries(registry).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters:
      "jsonSchema" in tool
        ? tool.jsonSchema
        : (zodToJsonSchema(tool.schema) as ToolParameters),
  }));
}
