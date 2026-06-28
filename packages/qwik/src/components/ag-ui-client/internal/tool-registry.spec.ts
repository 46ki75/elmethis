import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
  defineJsonSchemaTool,
  defineTool,
  getToolDefinitions,
  type ToolRegistry,
} from "./tool-registry";

describe("getToolDefinitions", () => {
  test("converts a Zod-backed tool to JSON Schema via zod-to-json-schema", () => {
    const registry: ToolRegistry = {
      add: defineTool({
        description: "Add two numbers",
        schema: z.object({ a: z.number(), b: z.number() }),
        execute: ({ a, b }) => a + b,
      }),
    };

    const [def] = getToolDefinitions(registry);

    expect(def.name).toBe("add");
    expect(def.description).toBe("Add two numbers");
    expect(def.parameters.type).toBe("object");
    expect(def.parameters.properties).toMatchObject({
      a: { type: "number" },
      b: { type: "number" },
    });
    expect(def.parameters.required).toEqual(["a", "b"]);
  });

  test("passes a JSON-Schema-backed tool through verbatim", () => {
    const jsonSchema = {
      type: "object" as const,
      properties: { name: { type: "string" }, count: { type: "integer" } },
      required: ["name"],
    };
    const registry: ToolRegistry = {
      echo: defineJsonSchemaTool({
        description: "Echo input",
        jsonSchema,
        execute: (args) => args,
      }),
    };

    const [def] = getToolDefinitions(registry);

    expect(def.name).toBe("echo");
    expect(def.description).toBe("Echo input");
    expect(def.parameters).toBe(jsonSchema);
  });

  test("handles a mixed registry, branching per tool", () => {
    const registry: ToolRegistry = {
      uuid: defineTool({
        description: "Make a UUID",
        schema: z.object({}),
        execute: () => "abc",
      }),
      raw: defineJsonSchemaTool({
        description: "Raw schema",
        jsonSchema: { type: "object", properties: {}, required: [] },
        execute: () => null,
      }),
    };

    const defs = getToolDefinitions(registry);

    expect(defs).toHaveLength(2);
    const uuid = defs.find((d) => d.name === "uuid")!;
    const raw = defs.find((d) => d.name === "raw")!;
    expect(uuid.parameters.type).toBe("object");
    expect(raw.parameters).toEqual({
      type: "object",
      properties: {},
      required: [],
    });
  });
});
