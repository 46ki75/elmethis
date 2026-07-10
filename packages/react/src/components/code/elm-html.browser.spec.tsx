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

// Builds its entire visible DOM via an inline script rather than static
// markup — mirrors the real `advanced-rag-pipeline.html` fixture (a Claude
// Artifact export) that motivated this test. `allow-same-origin` is never
// granted alongside `allow-scripts` (a real security invariant, not a bug),
// so `contentDocument` is opaque here and the `contentDocument`-based
// measurement path can never see this content — regardless of how tall it
// ends up.
const SCRIPT_BUILT_HTML = `<div id="root"></div>
<script>
  var el = document.createElement("div");
  el.style.height = "900px";
  el.textContent = "built by script";
  document.getElementById("root").appendChild(el);
</script>`;

describe("[CSR] ElmHtml — autoHeight measurement", () => {
  // BUG: with `allowScripts`, `allow-same-origin` is (correctly) never
  // granted, so `contentDocument` is opaque and the `load`-based
  // `contentDocument`-measurement path can never run — autoHeight silently
  // never measures anything here, leaving the iframe stuck at the browser's
  // ~150px default no matter how tall the real (script-built) content is.
  test(
    "measures content height even when allowScripts makes contentDocument opaque",
    { retry: 2 },
    async () => {
      const screen = await render(
        <ElmHtml html={SCRIPT_BUILT_HTML} allowScripts />,
      );
      const iframe = screen.container.querySelector("iframe")!;

      await vi.waitFor(
        () => {
          expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
        },
        { timeout: 2000 },
      );
    },
  );

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

describe("[CSR] ElmHtml — toggling autoHeight with unchanged html", () => {
  // BUG: `loadedHtmlRef` only tracks the `html` string, not which iframe DOM
  // node actually loaded it — but `key={String(autoHeight)}` replaces the
  // iframe node on every toggle. Toggling autoHeight off and immediately back
  // on (with `html` unchanged) leaves `loadedHtmlRef.current === html` true
  // from the very first real load, so the "already loaded" shortcut wrongly
  // fires against the brand-new (remounted) iframe and attaches a
  // ResizeObserver to it. The real `load` event for that same node still
  // fires afterward and attaches a *second* ResizeObserver, silently
  // replacing the first in the effect's closure — the first is never
  // disconnected. A native ResizeObserver subclass counts constructions and
  // disconnects (see project convention for native-constructor spies) to
  // prove that every observer except the currently-live one gets cleaned up.
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

    globalThis.ResizeObserver = TrackingResizeObserver as typeof ResizeObserver;

    try {
      const screen = await render(<ElmHtml html={TALL_HTML} />);
      const getIframe = () => screen.container.querySelector("iframe")!;

      await vi.waitFor(
        () => {
          expect(parseInt(getIframe().style.height || "0", 10)).toBeGreaterThan(
            800,
          );
        },
        { timeout: 2000 },
      );

      await screen.rerender(<ElmHtml html={TALL_HTML} autoHeight={false} />);
      await screen.rerender(<ElmHtml html={TALL_HTML} autoHeight={true} />);

      // The remounted iframe's real navigation can still be pending even
      // once the height has already converged (a wrongly-taken "already
      // loaded" shortcut can measure the same eventual value ahead of the
      // real event) -- and `readyState === "complete"` is a false-positive
      // signal here too, since a brand-new iframe's transient about:blank
      // document is *also* trivially "complete". Poll for the real content
      // instead, so the assertion below isn't racing the real `onLoad`
      // handler that creates the (correctly, single) or leaked (buggy,
      // duplicate) ResizeObserver.
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

describe("[CSR] ElmHtml — ResizeObserver on in-frame re-navigation", () => {
  // BUG: `attachObserver` overwrites the effect-scoped `observer` variable
  // without disconnecting whatever it previously held. `html`/`autoHeight`
  // unchanged means the effect never reruns and never tears down — but the
  // same iframe node can still fire a *second* native `load` event on its
  // own (the embedded document re-navigating itself, e.g. a same-origin
  // `location.reload()`), which re-runs `onLoad` -> `attachObserver()` and
  // silently orphans the first ResizeObserver.
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

      await vi.waitFor(
        () => {
          expect(instances.length).toBeGreaterThanOrEqual(1);
          expect(
            iframe.contentDocument?.documentElement?.textContent,
          ).toContain("tall");
        },
        { timeout: 2000 },
      );

      const countBeforeReload = instances.length;

      // Same iframe node, no React prop change — a real second `load` event
      // triggered by the framed document itself re-navigating.
      iframe.contentWindow!.location.reload();

      await vi.waitFor(
        () => {
          expect(instances.length).toBeGreaterThan(countBeforeReload);
        },
        { timeout: 2000 },
      );

      expect(instances.slice(0, -1).every((o) => o.disconnected)).toBe(true);
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });
});

describe("[CSR] ElmHtml — remote src", () => {
  // A `data:` URL gets a unique opaque origin per navigation — the same
  // cross-origin protection a real https:// src would get — so it exercises
  // the "contentDocument is inaccessible" path without a network dependency.
  const OPAQUE_ORIGIN_SRC =
    "data:text/html,<div style=%22height:900px%22></div>";

  test("navigates the iframe without crashing and never measures a height", async () => {
    const screen = await render(
      <ElmHtml src={OPAQUE_ORIGIN_SRC} autoHeight={true} height={200} />,
    );
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(iframe.getAttribute("src")).toBe(OPAQUE_ORIGIN_SRC);
    });

    // Give any (incorrect) measurement attempt a chance to fire, then assert
    // it never did: contentHeight stays unset, so the explicit `height` prop
    // — not a measured value — is still what's applied.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(iframe.getAttribute("height")).toBe("200");
  });

  // BUG: a blanket `if (usingSrc) return;` at the top of the measurement
  // effect bailed out for EVERY `src`, even one that's actually same-origin
  // (or otherwise gets `allow-same-origin` treatment). A `blob:` URL created
  // by this same window is exactly that case — its origin is this window's
  // own origin — so `contentDocument` access works fine, same as `html`
  // mode, and autoHeight should measure it instead of silently doing
  // nothing.
  test(
    "measures content height for a same-origin (blob:) src",
    { retry: 2 },
    async () => {
      const blobUrl = URL.createObjectURL(
        new Blob(['<div style="height: 900px;">tall</div>'], {
          type: "text/html",
        }),
      );

      try {
        const screen = await render(<ElmHtml src={blobUrl} />);
        const iframe = screen.container.querySelector("iframe")!;

        await vi.waitFor(
          () => {
            expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(
              800,
            );
          },
          { timeout: 2000 },
        );
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    },
  );
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
