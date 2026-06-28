import { $, component$, useStore } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import {
  createAgentSubscriber,
  type AgentSubscriberState,
} from "../internal/create-agent-subscriber";

// Streaming regression: the SDK rebuilds the whole message list and hands a
// fresh array (new object identities) to `onMessagesChanged` on EVERY delta.
// The renderer streams assistant content through `ElmMarkdown`, which relies on
// fine-grained reactivity of `message.content`. If the subscriber swaps in new
// objects wholesale, the content binding can fail to repaint — the bubble stays
// empty even though the data is correct (the copy button still copies it).
//
// This drives the real subscriber + real renderer and asserts the streamed
// text actually appears and keeps updating. createDOM can't cover this (it
// doesn't expand the nested optimizer-compiled component tree), so it lives in
// the browser layer.

describe("[CSR] ElmAgUiMessageRenderer — streaming assistant content repaints", () => {
  test("content delivered via onMessagesChanged appears and updates", async () => {
    const Harness = component$(() => {
      const state = useStore<AgentSubscriberState>({
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: [{ id: "a1", role: "assistant", content: "" } as any],
        isRunning: true,
        status: "running",
        activity: "writing",
        pendingInterrupts: [],
      });

      // Mimic one streaming delta: the SDK hands a brand-new array of
      // brand-new message objects with the grown content.
      const emit$ = $((content: string) => {
        const sub = createAgentSubscriber({
          state,
          getTools: () => ({}),
          onNeedsReRun: () => {},
        });
        sub.onMessagesChanged?.({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: [{ id: "a1", role: "assistant", content } as any],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      });

      return (
        <div>
          <button data-testid="d1" onClick$={() => emit$("Partial stream")}>
            d1
          </button>
          <button
            data-testid="d2"
            onClick$={() => emit$("Fully streamed answer")}
          >
            d2
          </button>
          <ElmAgUiMessageRenderer
            messages={state.messages}
            isRunning={state.isRunning}
            handleRetry$={$(() => {})}
          />
        </div>
      );
    });

    const screen = await render(<Harness />);

    // First delta: partial content must paint.
    await screen.getByTestId("d1").click();
    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("Partial stream"),
    );

    // Second delta: the bubble must update to the new content.
    await screen.getByTestId("d2").click();
    await vi.waitFor(() =>
      expect(screen.container.textContent).toContain("Fully streamed answer"),
    );
  });
});
