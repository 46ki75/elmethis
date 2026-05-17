import { describe, expect, test, vi } from "vitest";

import { adaptMcpTool } from "./adapt-mcp-tool";
import type { McpToolDescriptor } from "./mcp-types";
import type { JsonSchemaToolDef } from "./tool-registry";

const baseDescriptor: McpToolDescriptor = {
  name: "read_file",
  description: "Read a file from disk",
  inputSchema: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
};

describe("adaptMcpTool", () => {
  test("prefixes the name when `prefix` is supplied", () => {
    const { name } = adaptMcpTool(baseDescriptor, vi.fn(), { prefix: "fs" });
    expect(name).toBe("fs__read_file");
  });

  test("uses the descriptor name verbatim when no prefix is supplied", () => {
    const { name } = adaptMcpTool(baseDescriptor, vi.fn());
    expect(name).toBe("read_file");
  });

  test("returns a JsonSchemaToolDef whose schema is the descriptor's inputSchema", () => {
    const { tool } = adaptMcpTool(baseDescriptor, vi.fn());
    const jsonSchemaTool = tool as JsonSchemaToolDef;
    expect(jsonSchemaTool.jsonSchema).toBe(baseDescriptor.inputSchema);
    expect(jsonSchemaTool.description).toBe("Read a file from disk");
  });

  test("falls back to the descriptor name when description is missing", () => {
    const { tool } = adaptMcpTool(
      { name: "ping", inputSchema: { type: "object" } },
      vi.fn(),
    );
    expect(tool.description).toBe("ping");
  });

  test("execute delegates to callTool using the ORIGINAL name", async () => {
    const callTool = vi.fn().mockResolvedValue({ ok: true });
    const { tool } = adaptMcpTool(baseDescriptor, callTool, { prefix: "fs" });

    const result = await tool.execute({ path: "/tmp/x" });

    expect(callTool).toHaveBeenCalledTimes(1);
    expect(callTool).toHaveBeenCalledWith("read_file", { path: "/tmp/x" });
    expect(result).toEqual({ ok: true });
  });

  test("execute passes an empty object when args is undefined", async () => {
    const callTool = vi.fn().mockResolvedValue(null);
    const { tool } = adaptMcpTool(baseDescriptor, callTool);

    await (tool.execute as (args?: unknown) => Promise<unknown>)(undefined);

    expect(callTool).toHaveBeenCalledWith("read_file", {});
  });

  test("throws when the prefixed name exceeds 64 characters", () => {
    const longId = "a".repeat(70);
    expect(() =>
      adaptMcpTool(baseDescriptor, vi.fn(), { prefix: longId }),
    ).toThrow(/exceeds 64 characters/);
  });

  test("throws when the prefixed name contains illegal characters", () => {
    expect(() =>
      adaptMcpTool(baseDescriptor, vi.fn(), { prefix: "weird.id" }),
    ).toThrow(/must match/);
  });

  test("throws when the descriptor name itself contains illegal characters", () => {
    expect(() =>
      adaptMcpTool(
        { name: "weird.tool", inputSchema: { type: "object" } },
        vi.fn(),
      ),
    ).toThrow(/must match/);
  });
});
