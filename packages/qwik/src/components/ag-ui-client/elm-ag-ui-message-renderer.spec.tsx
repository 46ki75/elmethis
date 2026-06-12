import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { $ } from "@qwik.dev/core";
import type { Message } from "@ag-ui/core";

import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";

// Smoke-render coverage for the per-role dispatch in `ElmAgUiMessageRenderer`.
// The renderer fans each `Message` out to the matching elm sub-component
// (user → input-content, assistant → markdown + tool executions, etc.). These
// tests assert the visible content reaches the DOM for the common roles and
// that system/developer/tool roles are silently skipped. Full streaming /
// retry-action behavior and the auto-scroll reasoning panel need a live agent
// + real browser and are covered elsewhere.
//
// `handleRetry$` is inlined per-test (not a module const) so the lazy QRL
// segment never re-imports this spec module mid-run.

describe("[CSR] ElmAgUiMessageRenderer — role dispatch", () => {
  test("renders a user message's text via the input-content branch", async () => {
    const messages: Message[] = [
      { id: "1", role: "user", content: "ping from user" },
    ] as Message[];
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiMessageRenderer
        isRunning={false}
        handleRetry$={$(() => {})}
        messages={messages}
      />,
    );
    expect(screen.outerHTML).toContain("ping from user");
    expect(screen.outerHTML).toContain("User");
  });

  test("renders an assistant message's markdown content", async () => {
    const messages: Message[] = [
      { id: "1", role: "assistant", content: "## hello assistant" },
    ] as Message[];
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiMessageRenderer
        isRunning={false}
        handleRetry$={$(() => {})}
        messages={messages}
      />,
    );
    expect(screen.outerHTML).toContain("hello assistant");
    expect(screen.outerHTML).toContain("Assistant");
    // Heading markdown reaches a real <h2>.
    expect(screen.outerHTML.toLowerCase()).toContain("<h2");
  });

  test("an assistant message with tool calls renders the tool execution", async () => {
    const messages: Message[] = [
      {
        id: "1",
        role: "assistant",
        content: null,
        toolCalls: [
          {
            id: "tc1",
            type: "function",
            function: { name: "lookup_user", arguments: '{"id":1}' },
          },
        ],
      },
    ] as unknown as Message[];
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiMessageRenderer
        isRunning={true}
        handleRetry$={$(() => {})}
        messages={messages}
      />,
    );
    expect(screen.outerHTML).toContain("lookup_user");
  });

  test("system / developer / tool roles produce no visible content", async () => {
    const messages: Message[] = [
      { id: "1", role: "system", content: "secret system prompt" },
      { id: "2", role: "developer", content: "dev note" },
      { id: "3", role: "tool", toolCallId: "x", content: "tool output" },
    ] as Message[];
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiMessageRenderer
        isRunning={false}
        handleRetry$={$(() => {})}
        messages={messages}
      />,
    );
    expect(screen.outerHTML).not.toContain("secret system prompt");
    expect(screen.outerHTML).not.toContain("dev note");
    expect(screen.outerHTML).not.toContain("tool output");
  });

  test("renders an empty container for an empty message list", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiMessageRenderer
        isRunning={false}
        handleRetry$={$(() => {})}
        messages={[]}
      />,
    );
    // Renders the wrapper without throwing.
    expect(screen.outerHTML).toContain("div");
  });
});
