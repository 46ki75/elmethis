import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useMcpTools } from "./use-mcp-tools";
import { useMcpPrompts } from "./use-mcp-prompts";

// `useMcpConnections` (the lifecycle shared by useMcpTools/useMcpPrompts) only
// runs once its `useVisibleTask$` opens the transport — i.e. in a real browser;
// createDOM never fires that task. So this is a browser spec.
//
// We replace `createMcpClient` with a fake handle; connect-count flows through
// `globalThis` (a true browser singleton) because lazy QRL segments re-import
// modules with fresh state. The harnesses are display-only — authoring an
// interactive QRL (onClick$ / visible-task) inside a spec module re-imports the
// spec on resolution and re-runs `describe`, so reconnect$ / resolve$ are left
// to the Storybook manual pass.

interface McpTestBridge {
  /** `createMcpClient` (connect) invocations. */
  connected: number;
}

const bridge = (): McpTestBridge =>
  (globalThis as unknown as { __mcpTest: McpTestBridge }).__mcpTest;

const waitFor = (cb: () => unknown) =>
  vi.waitFor(cb, { timeout: 5000, interval: 50 });

vi.mock("./create-mcp-client", () => ({
  // Deterministic in-memory MCP server: one tool, one prompt.
  createMcpClient: async () => {
    bridge().connected++;
    return {
      listTools: async () => [
        {
          name: "echo",
          description: "Echo back",
          inputSchema: { type: "object" as const },
        },
      ],
      callTool: async (name: string, args: Record<string, unknown>) => ({
        name,
        args,
      }),
      listPrompts: async () => [
        { name: "greet", description: "Greet someone", arguments: [] },
      ],
      getPrompt: async (_name: string, args: Record<string, string>) => ({
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `hello ${args.who ?? ""}`.trim(),
            },
          },
        ],
      }),
      close: async () => {},
    };
  },
}));

// The server config is inlined inside each harness rather than captured from a
// module-level const: a component QRL that closes over module scope re-imports
// the spec module on resolution, which re-runs `describe`. Capturing only
// imports (the hooks) keeps the harness segment self-contained.
const ToolsHarness = component$(() => {
  const { tools, status } = useMcpTools({
    servers: [{ id: "srv", url: "http://test.local/mcp" }],
  });
  return (
    <div>
      <div data-testid="status">{status["srv"]?.state}</div>
      <ul>
        {Object.keys(tools.value ?? {}).map((name) => (
          <li key={name} data-testid="tool">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
});

const PromptsHarness = component$(() => {
  const { prompts, status } = useMcpPrompts({
    servers: [{ id: "srv", url: "http://test.local/mcp" }],
  });
  return (
    <div>
      <div data-testid="status">{status["srv"]?.state}</div>
      <ul>
        {prompts.value.map((p) => (
          <li key={p.name} data-testid="prompt">
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
});

type Screen = Awaited<ReturnType<typeof render>>;

const textsOf = (screen: Screen, testId: string): string[] =>
  Array.from(
    screen.container.querySelectorAll(`[data-testid="${testId}"]`),
  ).map((el) => (el.textContent ?? "").trim());

beforeEach(() => {
  (globalThis as unknown as { __mcpTest: McpTestBridge }).__mcpTest = {
    connected: 0,
  };
});

describe("[CSR] useMcpConnections (via useMcpTools / useMcpPrompts)", () => {
  test("connects, lists tools, and surfaces them prefixed by server id", async () => {
    const screen = await render(<ToolsHarness />);

    await waitFor(() =>
      expect(screen.getByTestId("status").element().textContent).toBe("ready"),
    );
    expect(bridge().connected).toBe(1);
    expect(textsOf(screen, "tool")).toEqual(["srv__echo"]);
  });

  test("connects and lists prompts annotated to their server", async () => {
    const screen = await render(<PromptsHarness />);

    await waitFor(() =>
      expect(screen.getByTestId("status").element().textContent).toBe("ready"),
    );
    expect(bridge().connected).toBe(1);
    expect(textsOf(screen, "prompt")).toEqual(["greet"]);
  });
});
