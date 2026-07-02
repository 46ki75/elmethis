import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmHtml } from "./elm-html";

// Split into its own file for the same reason as
// elm-html-resize-observer-leak.browser.spec.tsx: a global `ResizeObserver`
// override combined with a direct, unwrapped `<ElmHtml>` render trips a
// QRL-segment-resolution bug in this toolchain version (qwik-vite +
// vitest-browser-qwik) whenever it shares a file with another test doing the
// same — confirmed by reproducing the exact
// "Calling the suite function inside test function is not allowed" error
// when this test lived alongside the toggle-leak test above. See that file's
// header comment for the full story.

const TALL_HTML = `<div style="height: 900px;">tall</div>`;

describe("[CSR] ElmHtml — ResizeObserver on in-frame re-navigation", () => {
  // BUG: `attachObserver` overwrites the task-scoped `observer` variable
  // without disconnecting whatever it previously held. `html`/`autoHeight`
  // unchanged means `useVisibleTask$` never reruns and never tears down —
  // but the same iframe node can still fire a *second* native `load` event
  // on its own (the embedded document re-navigating itself, e.g. a
  // same-origin `location.reload()`), which re-runs `onLoad` ->
  // `attachObserver()` and silently orphans the first ResizeObserver.
  test("does not leak a ResizeObserver when the same iframe re-navigates without any prop change", async () => {
    const OriginalResizeObserver = globalThis.ResizeObserver;
    const instances: { disconnected: boolean }[] = [];

    class TrackingResizeObserver extends OriginalResizeObserver {
      disconnected = false;

      constructor(callback: ResizeObserverCallback) {
        super(callback);
        instances.push(this);
      }

      disconnect() {
        this.disconnected = true;
        super.disconnect();
      }
    }

    globalThis.ResizeObserver = TrackingResizeObserver as typeof ResizeObserver;

    try {
      const screen = await render(<ElmHtml html={TALL_HTML} />);
      const iframe = screen.container.querySelector("iframe")!;

      // 5s (not the usual 2s) because CI runners are demonstrably slower
      // than local dev machines at qwik's iframe-load + resumability path —
      // this exact wait was seen timing out in CI at 2s while passing
      // reliably in dozens of local runs.
      await vi.waitFor(
        () => {
          expect(instances.length).toBeGreaterThanOrEqual(1);
          expect(
            iframe.contentDocument?.documentElement?.textContent,
          ).toContain("tall");
        },
        { timeout: 5000 },
      );

      const countBeforeReload = instances.length;

      // Same iframe node, no prop change — a real second `load` event
      // triggered by the framed document itself re-navigating.
      iframe.contentWindow!.location.reload();

      await vi.waitFor(
        () => {
          expect(instances.length).toBeGreaterThan(countBeforeReload);
        },
        { timeout: 5000 },
      );

      expect(instances.slice(0, -1).every((o) => o.disconnected)).toBe(true);
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });
});
