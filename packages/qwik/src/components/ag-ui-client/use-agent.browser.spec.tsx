import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { AgentSubscriber } from "@ag-ui/client";

import { useAgent } from "./use-agent";
import { ElmAgUiAgent } from "./elm-ag-ui-agent";

// The message-queue behavior lives in `useAgent` (send$ enqueues while running,
// abort$ pops newest-then-aborts, and the subscriber's onIdle drains FIFO). It
// only runs once the hook's `useVisibleTask$` builds the transport — i.e. in a
// real browser; createDOM never fires that task. So this is a browser spec.
//
// We replace the real `HttpAgent` with a fake that *parks* each run until the
// test settles it, letting a run stay in flight while we queue more messages.
// Coordination flows through `window` — a true browser singleton — rather than
// a captured const or a hook-option closure: lazy QRL segments re-import the
// spec module (fresh module state) and Qwik drops non-serializable hook options
// across the visible-task boundary. `window` survives both.

interface QueueTestBridge {
  constructed: boolean;
  /** Increments each time a run parks (after `onRunInitialized`). */
  runStarted: number;
  /** Count of `abortRun()` calls. */
  aborted: number;
  /** Settles the currently-parked run; null between runs. */
  finish: (() => void) | null;
}

const bridge = (): QueueTestBridge =>
  (globalThis as unknown as { __queueTest: QueueTestBridge }).__queueTest;

vi.mock("@ag-ui/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@ag-ui/client")>();

  // A transport that fires lifecycle hooks but holds the run open until the
  // test calls `bridge().finish()`. The success/finalize pair lets the hook's
  // onIdle drain the next queued message into a fresh (also-parked) run.
  class FakeHttpAgent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[] = [];
    private sub: AgentSubscriber | null = null;

    constructor() {
      bridge().constructed = true;
    }

    subscribe(sub: AgentSubscriber) {
      this.sub = sub;
      return {
        unsubscribe: () => {
          this.sub = null;
        },
      };
    }

    async runAgent() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.sub?.onRunInitialized?.({} as any);
      bridge().runStarted++;
      await new Promise<void>((resolve) => {
        bridge().finish = () => {
          bridge().finish = null;
          void (async () => {
            await this.sub?.onRunFinishedEvent?.(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { outcome: "success", event: {} } as any,
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await this.sub?.onRunFinalized?.({} as any);
            resolve();
          })();
        };
      });
      return {};
    }

    abortRun() {
      bridge().aborted++;
    }
  }

  return { ...actual, HttpAgent: FakeHttpAgent };
});

const QueueHarness = component$(() => {
  const { state, send$, retry$, abort$ } = useAgent({
    url: "http://test.local/run",
  });
  return (
    <ElmAgUiAgent state={state} send$={send$} retry$={retry$} abort$={abort$} />
  );
});

beforeEach(() => {
  (globalThis as unknown as { __queueTest: QueueTestBridge }).__queueTest = {
    constructed: false,
    runStarted: 0,
    aborted: 0,
    finish: null,
  };
});

describe("[CSR] useAgent — message queue", () => {
  type Screen = Awaited<ReturnType<typeof render>>;

  /** Type a prompt and click Send. */
  async function send(screen: Screen, body: string) {
    await screen.getByRole("textbox").fill(body);
    await screen.getByLabelText("Send").click();
  }

  /** The trimmed text of each rendered queue chip, top to bottom. */
  function queueTexts(screen: Screen): string[] {
    const container = screen.container.querySelector(
      '[class*="queue-container"]',
    );
    if (!container) return [];
    return Array.from(container.children).map((c) =>
      (c.textContent ?? "").trim(),
    );
  }

  const stopButton = (screen: Screen) =>
    screen.container.querySelector('[aria-label="Stop"]');

  test("queues while running, stop pops newest, then drains FIFO on completion", async () => {
    const screen = await render(<QueueHarness />);
    await vi.waitFor(() => expect(bridge().constructed).toBe(true));

    // First send starts a run immediately (nothing queued) — stop appears.
    // Wait on the DOM (the stop button), not the window counter: the counter
    // flips a tick before Qwik flushes the re-render.
    await send(screen, "first");
    await vi.waitFor(() => expect(stopButton(screen)).not.toBeNull());
    expect(bridge().runStarted).toBe(1);
    expect(queueTexts(screen)).toEqual([]);

    // Subsequent sends are held while the run is in flight.
    await send(screen, "second");
    await vi.waitFor(() => expect(queueTexts(screen)).toEqual(["second"]));

    await send(screen, "third");
    await vi.waitFor(() =>
      expect(queueTexts(screen)).toEqual(["second", "third"]),
    );

    // Stop removes the newest queued message (undo), not the live run.
    await screen.getByLabelText("Stop").click();
    await vi.waitFor(() => expect(queueTexts(screen)).toEqual(["second"]));
    expect(stopButton(screen)).not.toBeNull();
    expect(bridge().aborted).toBe(0);

    // Completing the run drains the oldest queued message into a fresh run.
    bridge().finish?.();
    await vi.waitFor(() => {
      expect(queueTexts(screen)).toEqual([]);
      expect(stopButton(screen)).not.toBeNull();
    });
    expect(bridge().runStarted).toBe(2);

    // Nothing left queued — the next completion settles to idle.
    bridge().finish?.();
    await vi.waitFor(() => expect(stopButton(screen)).toBeNull());
    expect(bridge().aborted).toBe(0);
  });

  test("stop aborts the live run when the queue is empty", async () => {
    const screen = await render(<QueueHarness />);
    await vi.waitFor(() => expect(bridge().constructed).toBe(true));

    await send(screen, "only");
    await vi.waitFor(() => expect(stopButton(screen)).not.toBeNull());
    expect(queueTexts(screen)).toEqual([]);

    // No queue to unwind, so stop aborts the transport.
    await screen.getByLabelText("Stop").click();
    await vi.waitFor(() => expect(bridge().aborted).toBe(1));
    await vi.waitFor(() => expect(stopButton(screen)).toBeNull());
  });
});
