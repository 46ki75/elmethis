import { describe, expect, it, vi } from "vitest";

import { adaptMcpTool } from "./adapt-mcp-tool";
import type { McpToolDescriptor } from "./mcp-types";

const descriptor: McpToolDescriptor = {
  name: "read_file",
  description: "Read a file",
  inputSchema: {
    type: "object",
    properties: { path: { type: "string" } },
    required: ["path"],
  },
};

describe("adaptMcpTool", () => {
  it("prefixes the surfaced name but calls the original MCP tool", async () => {
    const callTool = vi.fn().mockResolvedValue({ ok: true });
    const adapted = adaptMcpTool(descriptor, callTool, { prefix: "fs" });
    expect(adapted.name).toBe("fs__read_file");
    await adapted.tool.execute({ path: "/tmp/example" });
    expect(callTool).toHaveBeenCalledWith("read_file", {
      path: "/tmp/example",
    });
  });

  it("rejects provider-incompatible tool names", () => {
    expect(() =>
      adaptMcpTool(descriptor, vi.fn(), { prefix: "invalid.server" }),
    ).toThrow(/must match/);
    expect(() =>
      adaptMcpTool(descriptor, vi.fn(), { prefix: "a".repeat(64) }),
    ).toThrow(/exceeds 64/);
  });
});
