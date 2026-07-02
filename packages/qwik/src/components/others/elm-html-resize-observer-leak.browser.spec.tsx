import { component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmHtml } from "./elm-html";

// This regression test is split out from elm-html.browser.spec.tsx into its
// own file on purpose. Co-locating a global `ResizeObserver` override (below)
// with elm-html.browser.spec.tsx's other describe blocks — which render
// `<ElmHtml>` directly, unwrapped, in several separate tests — reproducibly
// tripped a QRL-segment-resolution bug in this toolchain version (qwik-vite +
// vitest-browser-qwik): loading this test's inline `component$` host mid-run
// re-executed the *other* file's top-level `describe(...)` calls, surfacing
// as `Calling the suite function inside test function is not allowed`. This
// reproduced regardless of which describe block ran first and regardless of
// whether the component host was defined inline or hoisted to module scope;
// only moving it to a separate file made it go away. Keeping this test alone
// in its own file avoids the interaction entirely.

const TALL_HTML = `<div style="height: 900px;">tall</div>`;

describe("[CSR] ElmHtml — toggling autoHeight with unchanged html", () => {
  // Regression test: toggling autoHeight off and immediately back on (with
  // `html` unchanged) replaces the iframe node (`key={String(autoHeight)}`).
  // The `useVisibleTask$` cleanup that runs before each re-run and on
  // unmount must disconnect every ResizeObserver except the one attached to
  // the currently-live iframe — otherwise observers pile up unbounded across
  // toggles. A native ResizeObserver subclass counts constructions and
  // disconnects (per this repo's native-constructor-spy convention: don't
  // `vi.spyOn` a native constructor, subclass it instead) to prove that.
  test("does not leak a ResizeObserver when autoHeight is toggled off and back on with the same html", async () => {
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

    const AutoHeightToggle = component$(() => {
      const autoHeight = useSignal(true);
      return (
        <div>
          <button
            data-testid="toggle-auto-height"
            onClick$={() => (autoHeight.value = !autoHeight.value)}
          >
            toggle auto height
          </button>
          <ElmHtml html={TALL_HTML} autoHeight={autoHeight.value} />
        </div>
      );
    });

    globalThis.ResizeObserver = TrackingResizeObserver as typeof ResizeObserver;

    try {
      const screen = await render(<AutoHeightToggle />);
      const getIframe = () => screen.container.querySelector("iframe")!;

      await vi.waitFor(
        () => {
          expect(parseInt(getIframe().style.height || "0", 10)).toBeGreaterThan(
            800,
          );
        },
        { timeout: 2000 },
      );

      await screen.getByTestId("toggle-auto-height").click(); // autoHeight -> false
      await screen.getByTestId("toggle-auto-height").click(); // autoHeight -> true

      // The remounted iframe's real navigation can still be pending even once
      // the height has already converged, and `readyState === "complete"` is
      // a false-positive signal here too, since a brand-new iframe's
      // transient about:blank document is also trivially "complete". Poll for
      // the real content instead, so the assertion below isn't racing the
      // real `load` handler that creates the (correctly, single) or leaked
      // (buggy, duplicate) ResizeObserver.
      const iframe = getIframe();
      await vi.waitFor(
        () => {
          expect(
            iframe.contentDocument?.documentElement?.textContent,
          ).toContain("tall");
        },
        { timeout: 2000 },
      );

      expect(instances.length).toBeGreaterThan(1);
      expect(instances.slice(0, -1).every((o) => o.disconnected)).toBe(true);
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });
});
