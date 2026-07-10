import { render } from "vitest-browser-vue";
import { defineComponent } from "vue";
import { describe, expect, test, vi } from "vitest";

import { ElmHtml } from "./elm-html";

// Real navigation + real layout only exist in a real browser: happy-dom
// doesn't parse `srcdoc` into a measurable document, enforce `sandbox`, or
// compute layout (`getBoundingClientRect` is always zero), so these bugs —
// found in code review on the react sibling and carried over here as
// regression coverage — need the Chromium layer to reproduce faithfully.

const TALL_HTML = `<div style="height: 900px;">tall</div>`;

// Grows from 50px to 900px shortly after load, purely via CSS — no script
// execution needed (and none would run under the default sandbox anyway), so
// a ResizeObserver watching the real content root is required to catch the
// growth; one measurement taken at `load` time is not enough.
const GROWING_HTML = `<style>
  @keyframes grow { from { height: 50px; } to { height: 900px; } }
  div { animation: grow 0.2s forwards; }
</style><div>content</div>`;

describe("[CSR] ElmHtml — autoHeight measurement", () => {
  test("measures and applies the content height by default", async () => {
    const screen = render(ElmHtml, { props: { html: TALL_HTML } });
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 2000 },
    );
  });

  // A caller-supplied `sandbox` override that omits `allow-same-origin` (and
  // doesn't request scripts) must not make the iframe's document opaque to
  // the parent: `allow-same-origin` should still be force-added so the
  // height keeps getting measured.
  test("still measures the content height when a caller's sandbox override doesn't request scripts", async () => {
    const screen = render(ElmHtml, {
      props: { html: TALL_HTML, sandbox: "allow-forms" },
    });
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 2000 },
    );
  });

  // Security guard (not a reproduced bug): allow-scripts + allow-same-origin
  // together let an embedded document escape the sandbox entirely, so
  // autoHeight must never force allow-same-origin onto a sandbox that also
  // allows scripts — even though that means autoHeight can't measure there.
  test("never adds allow-same-origin when the caller's sandbox override allows scripts", async () => {
    const screen = render(ElmHtml, {
      props: { html: TALL_HTML, sandbox: "allow-scripts" },
    });
    const iframe = screen.container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).not.toContain(
      "allow-same-origin",
    );
  });
});

// Built entirely by an inline bootstrap <script> rather than static markup —
// mirrors the real `advanced-rag-pipeline.html` fixture (a Claude Artifact
// export), where the whole visible DOM only exists after the script runs.
const SCRIPT_BUILT_HTML = `<div id="root"></div>
<script>
  var el = document.createElement("div");
  el.style.height = "900px";
  el.textContent = "built by script";
  document.getElementById("root").appendChild(el);
</script>`;

describe("[CSR] ElmHtml — autoHeight measurement with allowScripts", () => {
  // BUG: `allow-same-origin` is never granted together with `allow-scripts`
  // (see elm-html.tsx for why), so `contentDocument` is opaque whenever
  // `allowScripts` is true — the `load` + ResizeObserver strategy below can
  // never read `contentDocument.documentElement`, so the height silently
  // stays stuck at the browser's ~150px iframe default no matter how tall
  // the real content is.
  test("measures the content height even when allowScripts is on (contentDocument is opaque)", async () => {
    const screen = render(ElmHtml, {
      props: { html: SCRIPT_BUILT_HTML, allowScripts: true },
    });
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(
      () => {
        expect(parseInt(iframe.style.height || "0", 10)).toBeGreaterThan(800);
      },
      { timeout: 2000 },
    );
  });
});

describe("[CSR] ElmHtml — ResizeObserver keeps tracking real content", () => {
  // While `autoHeight` is off, `srcdoc` (bound unconditionally) may still be
  // navigating when it's flipped back on. The observer/`load` watcher must
  // still end up attached to the real content root rather than getting stuck
  // on a premature or stale measurement, so later height growth keeps being
  // observed.
  test("keeps measuring height changes when autoHeight is toggled off and back on across an html change", async () => {
    const screen = render(ElmHtml, {
      props: { autoHeight: false, html: "<p>a</p>" },
    });

    await screen.rerender({ autoHeight: false, html: GROWING_HTML });
    await screen.rerender({ autoHeight: true, html: GROWING_HTML });

    // Toggling autoHeight forces a fresh iframe (see elm-html.tsx via the
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

describe("[CSR] ElmHtml — toggling autoHeight with unchanged html", () => {
  // Regression test: `key={String(autoHeight)}` replaces the iframe DOM node
  // on every toggle. Toggling autoHeight off and immediately back on (with
  // `html` unchanged) must not leave a stale ResizeObserver attached to a
  // now-discarded iframe node — every observer except the currently-live one
  // must get disconnected. A native ResizeObserver subclass counts
  // constructions and disconnects (see project convention for
  // native-constructor spies) to prove that.
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
      const screen = render(ElmHtml, {
        props: { html: TALL_HTML, autoHeight: true },
      });
      const getIframe = () => screen.container.querySelector("iframe")!;

      await vi.waitFor(
        () => {
          expect(parseInt(getIframe().style.height || "0", 10)).toBeGreaterThan(
            800,
          );
        },
        { timeout: 2000 },
      );

      await screen.rerender({ html: TALL_HTML, autoHeight: false });
      await screen.rerender({ html: TALL_HTML, autoHeight: true });

      // The remounted iframe's real navigation can still be pending even
      // once the height has already converged, and
      // `readyState === "complete"` is a false-positive signal here too,
      // since a brand-new iframe's transient about:blank document is *also*
      // trivially "complete". Poll for the real content instead, so the
      // assertion below isn't racing the real `load` handler that creates
      // the (correctly, single) or leaked (buggy, duplicate) ResizeObserver.
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
  // BUG: `attachObserver` overwrites the closure-scoped `observer` variable
  // without disconnecting whatever it previously held. `html`/`autoHeight`
  // unchanged means `disposeLifecycle`/`attachLifecycle` never rerun — but
  // the same iframe node can still fire a *second* native `load` event on
  // its own (the embedded document re-navigating itself, e.g. a same-origin
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
      const screen = render(ElmHtml, { props: { html: TALL_HTML } });
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

      // Same iframe node, no prop change — a real second `load` event
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
    const screen = render(ElmHtml, {
      props: { src: OPAQUE_ORIGIN_SRC, autoHeight: true, height: 200 },
    });
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
});

describe("[CSR] ElmHtml — layout defaults", () => {
  test("fills its container width by default", async () => {
    const Harness = defineComponent({
      name: "Harness",
      setup() {
        return () => (
          <div style={{ width: "500px" }}>
            <ElmHtml html="<p>x</p>" autoHeight={false} height={100} />
          </div>
        );
      },
    });
    const screen = render(Harness);
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(iframe.getBoundingClientRect().width).toBeCloseTo(500, 0);
    });
  });

  test("renders as a block-level box, not inline", async () => {
    const screen = render(ElmHtml, {
      props: { html: "<p>x</p>", autoHeight: false, height: 100 },
    });
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(getComputedStyle(iframe).display).toBe("block");
    });
  });
});
