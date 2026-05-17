import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type ToolParameters = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  [k: string]: unknown;
};

/**
 * Tool definition driven by a Zod schema. `execute` receives args typed
 * from `z.infer<T>`; the JSON Schema fed to the agent is generated via
 * `zod-to-json-schema` at call time.
 */
export interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => unknown;
}

/**
 * Tool definition driven by a prebuilt JSON Schema. Use when the schema
 * comes from somewhere other than Zod (e.g., an MCP server's
 * `tools/list` response) and reverse-converting to Zod is unnecessary.
 */
export interface JsonSchemaToolDef {
  description: string;
  jsonSchema: ToolParameters;
  execute: (args: Record<string, unknown>) => unknown;
}

export type AnyToolDef =
  | ToolDef<z.ZodObject<z.ZodRawShape>>
  | JsonSchemaToolDef;

export type ToolRegistry = Record<string, AnyToolDef>;

/**
 * Define a tool with full type inference on the `execute` callback args.
 *
 * TypeScript infers `T` from the `schema` field, so `execute` receives the
 * exact shape produced by `z.infer<T>` rather than the erased `ZodRawShape`.
 * The result is cast to {@link AnyToolDef} so it can be stored in a
 * {@link ToolRegistry}.
 *
 * @example
 * ```ts
 * defineTool({
 *   description: "Generate a random UUID",
 *   schema: z.object({ version: z.enum(["v4", "v7"]) }),
 *   execute: async ({ version }) => ({ uuid: version === "v4" ? v4() : v7() }),
 * });
 * ```
 */
export function defineTool<T extends z.ZodObject<z.ZodRawShape>>(
  tool: ToolDef<T>,
): AnyToolDef {
  return tool as unknown as AnyToolDef;
}

/**
 * Define a tool using a prebuilt JSON Schema. Bypasses
 * `zod-to-json-schema`. Args are typed as `Record<string, unknown>` —
 * validate inside `execute` if you need stricter shape guarantees.
 */
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
