import { StrictMode } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmHtml } from "./elm-html";

// Real navigation + real layout only exist in a real browser: happy-dom
// doesn't parse `srcDoc` into a measurable document, enforce `sandbox`, or
// compute layout (`getBoundingClientRect` is always zero), so these bugs —
// found in code review — need the Chromium layer to reproduce faithfully.

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
      { timeout: 2000 },
    );
  });

  // BUG: a caller-supplied `sandbox` override that omits `allow-same-origin`
  // (and doesn't request scripts) made the iframe's document opaque to the
  // parent — `contentDocument` was always null on `load`, so the height was
  // never measured, with no fallback.
  test("still measures the content height when a caller's sandbox override doesn't request scripts", async () => {
    const screen = await render(
      <ElmHtml html={TALL_HTML} sandbox="allow-forms" />,
    );
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 2000 },
    );
  });

  // Security guard (not the reproduced bug): allow-scripts + allow-same-origin
  // together let an embedded document escape the sandbox entirely, so
  // autoHeight must never force allow-same-origin onto a sandbox that also
  // allows scripts — even though that means autoHeight can't measure there.
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
  // BUG: under React.StrictMode, the mount effect runs, cleans up, and runs
  // again in the same tick. By the second run `prevHtmlRef` already equals
  // `html`, so the "html unchanged" check is fooled into calling `sync()`
  // immediately — before the iframe has actually navigated to `html`. That
  // premature `sync()` attaches the ResizeObserver to the transient
  // about:blank document. When the real `load` event later fires, `measure()`
  // corrects the height once, but the `!observer` guard skips re-attaching
  // to the real content root — so later height changes are never observed.
  test("keeps measuring height changes after mount inside React.StrictMode", async () => {
    const screen = await render(
      <StrictMode>
        <ElmHtml html={GROWING_HTML} />
      </StrictMode>,
    );
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 3000 },
    );
  });

  // BUG: while `autoHeight` is off, `prevHtmlRef` is still updated on every
  // `html` change even though `srcDoc` (bound unconditionally) may still be
  // navigating. Flipping `autoHeight` back on without a further `html`
  // change makes the "html unchanged" check wrongly true, so `sync()` runs
  // immediately instead of waiting for `load` — the same premature-attach
  // hazard as the StrictMode case above, reached via prop toggling instead.
  test("keeps measuring height changes when autoHeight is toggled off and back on across an html change", async () => {
    const screen = await render(<ElmHtml autoHeight={false} html="<p>a</p>" />);

    await screen.rerender(<ElmHtml autoHeight={false} html={GROWING_HTML} />);
    await screen.rerender(<ElmHtml autoHeight={true} html={GROWING_HTML} />);

    // Toggling autoHeight can force a fresh iframe element (see elm-html.tsx),
    // so re-query rather than reusing a reference captured before the toggle.
    await vi.waitFor(
      () => {
        const iframe = screen.container.querySelector("iframe")!;
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 3000 },
    );
  });
});

describe("[CSR] ElmHtml — layout defaults", () => {
  // BUG: the module CSS only sets `border: none`, so with no width supplied
  // by the caller the iframe falls back to its ~300px intrinsic default
  // width instead of filling its container.
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

  // BUG: no `display: block` is set, so the iframe keeps the UA-default
  // inline-level box, leaving a baseline gap below the measured height.
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
