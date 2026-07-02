import { component$, useSignal } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmHtml } from "./elm-html";

// Real navigation + real layout only exist in a real browser: happy-dom
// (the unit layer's createDOM) doesn't parse `srcDoc` into a measurable
// document, enforce `sandbox`, or compute layout (`getBoundingClientRect` is
// always zero), so these bugs — found in code review on the react side, and
// ported here since the same lifecycle logic now lives in qwik's
// `useVisibleTask$` — need the Chromium layer to reproduce faithfully.
//
// Qwik's `vitest-browser-qwik` render result has no `rerender(...)`, so
// prop-change-driven tests below wrap the component under test in a small
// local `component$` host with its own `useSignal` state and a button to
// flip it, per this repo's established browser-test pattern (see
// elm-markdown.browser.spec.tsx / elm-button-dropdown.browser.spec.tsx).

const TALL_HTML = `<div style="height: 900px;">tall</div>`;

// Grows from 50px to 900px shortly after load, purely via CSS — no script
// execution needed (and none would run under the default sandbox anyway),
// so a ResizeObserver watching the real content root is required to catch
// the growth; one measurement taken at `load` time is not enough.
const GROWING_HTML = `<style>
  @keyframes grow { from { height: 50px; } to { height: 900px; } }
  div { animation: grow 0.2s forwards; }
</style><div>content</div>`;

describe("[CSR] ElmHtml — autoHeight measurement", () => {
  test("measures and applies the content height by default", async () => {
    const screen = await render(<ElmHtml html={TALL_HTML} />);
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      // 12s (not the usual 2s) because CI runners are demonstrably slower
      // than local dev machines at qwik's iframe-load + resumability path —
      // this exact wait was seen timing out in CI at 2s while passing
      // reliably in dozens of local runs.
      { timeout: 12000 },
    );
  });

  // A caller-supplied `sandbox` override that omits `allow-same-origin` (and
  // doesn't request scripts) must not make the iframe's document opaque to
  // the parent — `contentDocument` should still resolve so the height gets
  // measured.
  test("still measures the content height when a caller's sandbox override doesn't request scripts", async () => {
    const screen = await render(
      <ElmHtml html={TALL_HTML} sandbox="allow-forms" />,
    );
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      // 12s (not the usual 2s) because CI runners are demonstrably slower
      // than local dev machines at qwik's iframe-load + resumability path —
      // this exact wait was seen timing out in CI at 2s while passing
      // reliably in dozens of local runs.
      { timeout: 12000 },
    );
  });

  // Security guard: allow-scripts + allow-same-origin together let an
  // embedded document escape the sandbox entirely, so autoHeight must never
  // force allow-same-origin onto a sandbox that also allows scripts — even
  // though that means autoHeight can't measure there.
  test("never adds allow-same-origin when the caller's sandbox override allows scripts", async () => {
    const screen = await render(
      <ElmHtml html={TALL_HTML} sandbox="allow-scripts" />,
    );
    const iframe = screen.container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});

describe("[CSR] ElmHtml — ResizeObserver keeps tracking real content", () => {
  // While `autoHeight` is off, the iframe's `srcDoc` (bound unconditionally)
  // may still be navigating. Flipping `autoHeight` back on across an `html`
  // change must still end up with a live ResizeObserver watching the real
  // content root — not stuck on a stale/transient document — so later height
  // changes (the growth animation) are still observed.
  test("keeps measuring height changes when autoHeight is toggled off and back on across an html change", async () => {
    const ToggleAcrossHtmlChange = component$(() => {
      const html = useSignal("<p>a</p>");
      const autoHeight = useSignal(false);
      return (
        <div>
          <button
            data-testid="to-growing-html"
            onClick$={() => (html.value = GROWING_HTML)}
          >
            to growing html
          </button>
          <button
            data-testid="enable-auto-height"
            onClick$={() => (autoHeight.value = true)}
          >
            enable auto height
          </button>
          <ElmHtml html={html.value} autoHeight={autoHeight.value} />
        </div>
      );
    });

    const screen = await render(<ToggleAcrossHtmlChange />);

    await screen.getByTestId("to-growing-html").click();
    await screen.getByTestId("enable-auto-height").click();

    // Toggling autoHeight forces a fresh iframe (see elm-html.tsx's
    // `key={String(autoHeight)}`), so re-query rather than reusing a
    // reference captured before the toggle.
    await vi.waitFor(
      () => {
        const iframe = screen.container.querySelector("iframe")!;
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 3000 },
    );
  });
});

// The ResizeObserver-leak-on-toggle regression test lives in its own file,
// elm-html-resize-observer-leak.browser.spec.tsx: co-locating a global
// `ResizeObserver` override with the other describe blocks above (which
// render `<ElmHtml>` directly, unwrapped) tripped a QRL-segment-resolution
// bug in this toolchain version (qwik-vite + vitest-browser-qwik) — the
// symptom was `Calling the suite function inside test function is not
// allowed`, i.e. loading one test's QRL chunk mid-run re-executed this
// module's top-level `describe(...)` calls. Splitting the file sidesteps it;
// see that file's header comment for the full story.

describe("[CSR] ElmHtml — layout defaults", () => {
  test("fills its container width by default", async () => {
    const screen = await render(
      <div style={{ width: "500px" }}>
        <ElmHtml html="<p>x</p>" autoHeight={false} height={100} />
      </div>,
    );
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(iframe.getBoundingClientRect().width).toBeCloseTo(500, 0);
    });
  });

  test("renders as a block-level box, not inline", async () => {
    const screen = await render(
      <ElmHtml html="<p>x</p>" autoHeight={false} height={100} />,
    );
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(getComputedStyle(iframe).display).toBe("block");
    });
  });
});
