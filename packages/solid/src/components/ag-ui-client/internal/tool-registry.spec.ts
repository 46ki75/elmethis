import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  defineJsonSchemaTool,
  defineTool,
  getToolDefinitions,
  type ToolRegistry,
} from "./tool-registry";

describe("getToolDefinitions", () => {
  it("converts Zod tools and preserves JSON Schema tools", () => {
    const rawSchema = { type: "object" as const, properties: {} };
    const registry: ToolRegistry = {
      add: defineTool({
        description: "Add two numbers",
        schema: z.object({ a: z.number(), b: z.number() }),
        execute: ({ a, b }) => a + b,
      }),
      raw: defineJsonSchemaTool({
        description: "Raw tool",
        jsonSchema: rawSchema,
        execute: (args) => args,
      }),
    };

    const definitions = getToolDefinitions(registry);
    expect(definitions[0].parameters).toMatchObject({
      type: "object",
      required: ["a", "b"],
    });
    expect(definitions[1].parameters).toBe(rawSchema);
  });
});
