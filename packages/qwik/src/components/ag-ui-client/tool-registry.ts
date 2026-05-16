import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => unknown;
}

export type AnyToolDef = ToolDef<z.ZodObject<z.ZodRawShape>>;
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

export function getToolDefinitions(registry: ToolRegistry) {
  return Object.entries(registry).map(([name, { description, schema }]) => ({
    name,
    description,
    parameters: zodToJsonSchema(schema) as {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    },
  }));
}
