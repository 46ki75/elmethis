import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import type { McpClientHandle } from "./mcp-types";
import { useMcpTools, type UseMcpToolsReturn } from "./use-mcp-tools";

const createHandle = () =>
  ({
    listTools: () =>
      Promise.resolve([{ name: "lookup", inputSchema: { type: "object" } }]),
    callTool: () => Promise.resolve(null),
    listPrompts: () => Promise.resolve([]),
    getPrompt: () => Promise.resolve({ messages: [] }),
    close: vi.fn(() => Promise.resolve()),
  }) satisfies McpClientHandle;

describe("useMcpTools", () => {
  it("merges tool lists returned in the same microtask batch and closes both connections", async () => {
    const handles = { first: createHandle(), second: createHandle() };
    let result!: UseMcpToolsReturn;
    const Harness = () => {
      result = useMcpTools({
        servers: [
          { id: "first", url: "https://first.test/mcp" },
          { id: "second", url: "https://second.test/mcp" },
        ],
        clientFactory: ({ id }) =>
          Promise.resolve(id === "first" ? handles.first : handles.second),
      });
      return null;
    };
    const rendered = render(() => <Harness />);
    await vi.waitFor(() => {
      expect(result.status.first?.state).toBe("ready");
      expect(result.status.second?.state).toBe("ready");
    });
    expect(Object.keys(result.tools()).sort()).toEqual([
      "first__lookup",
      "second__lookup",
    ]);
    rendered.unmount();
    expect(handles.first.close).toHaveBeenCalledOnce();
    expect(handles.second.close).toHaveBeenCalledOnce();
  });
});
