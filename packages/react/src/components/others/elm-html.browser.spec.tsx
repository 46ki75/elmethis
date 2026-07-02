import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmHtml } from "./elm-html";

// Real navigation + real layout only exist in a real browser: happy-dom
// doesn't parse `srcDoc` into a measurable document, enforce `sandbox`, or
// compute layout (`getBoundingClientRect` is always zero), so these bugs —
// found in code review — need the Chromium layer to reproduce faithfully.

const TALL_HTML = `<div style="height: 900px;">tall</div>`;

describe("[CSR] ElmHtml — autoHeight measurement", () => {
  test("measures and applies the content height by default", async () => {
    const screen = await render(<ElmHtml html={TALL_HTML} />);
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
    });
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
