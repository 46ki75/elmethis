import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmHtml } from "./elm-html";

const TALL_HTML = '<div style="height:900px">tall</div>';
const GROWING_HTML = `<style>
@keyframes grow { from { height: 50px; } to { height: 900px; } }
div { animation: grow 0.2s forwards; }
</style><div>growing</div>`;
const SCRIPT_BUILT_HTML = `<div id="root"></div>
<script>
  var element = document.createElement("div");
  element.style.height = "900px";
  element.textContent = "built by script";
  document.getElementById("root").appendChild(element);
</script>`;

const iframeOf = (container: HTMLElement) =>
  container.querySelector("iframe") as HTMLIFrameElement;

const waitForTallFrame = async (container: HTMLElement, timeout = 3000) => {
  await vi.waitFor(
    () => {
      expect(
        parseInt(iframeOf(container).style.height || "0", 10),
      ).toBeGreaterThan(800);
    },
    { timeout },
  );
};

describe("[Browser] ElmHtml auto-height", () => {
  it("measures static content and continues observing script-free CSS growth", async () => {
    const [html, setHtml] = createSignal(TALL_HTML);
    const rendered = render(() => <ElmHtml html={html()} />);

    await waitForTallFrame(rendered.container);
    setHtml(GROWING_HTML);
    await waitForTallFrame(rendered.container);
  });

  it(
    "measures script-built content through the namespaced reporter",
    { retry: 2 },
    async () => {
      const rendered = render(() => (
        <ElmHtml html={SCRIPT_BUILT_HTML} allowScripts />
      ));

      await waitForTallFrame(rendered.container);
      const tokens = iframeOf(rendered.container)
        .getAttribute("sandbox")
        ?.split(/\s+/);
      expect(tokens).toContain("allow-scripts");
      expect(tokens).not.toContain("allow-same-origin");
    },
  );

  it("keeps a caller height until a real measurement replaces it", async () => {
    const rendered = render(() => (
      <ElmHtml
        html={TALL_HTML}
        height={200}
        // eslint-disable-next-line solid/style-prop
        style="color:red"
      />
    ));
    const iframe = iframeOf(rendered.container);

    expect(iframe).toHaveAttribute("height", "200");
    await waitForTallFrame(rendered.container);
    expect(iframe).not.toHaveAttribute("height");
    expect(iframe.style.color).toBe("red");
  });

  it("rejects a namespaced height message from any other window", async () => {
    const rendered = render(() => (
      <ElmHtml html={SCRIPT_BUILT_HTML} allowScripts />
    ));
    await waitForTallFrame(rendered.container);
    const iframe = iframeOf(rendered.container);
    const measured = iframe.style.height;

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          kind: "elmethis:elm-html:auto-height",
          height: 9999,
        },
        source: window,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(iframe.style.height).toBe(measured);
    expect(iframe.style.height).not.toBe("9999px");
  });
});

describe("[Browser] ElmHtml iframe ownership and cleanup", () => {
  it("recreates the browsing context and disconnects observers on every autoHeight toggle", async () => {
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

    globalThis.ResizeObserver = TrackingResizeObserver;
    try {
      const [autoHeight, setAutoHeight] = createSignal(true);
      const rendered = render(() => (
        <ElmHtml html={TALL_HTML} autoHeight={autoHeight()} />
      ));
      await waitForTallFrame(rendered.container);
      const firstFrame = iframeOf(rendered.container);

      setAutoHeight(false);
      const fixedFrame = iframeOf(rendered.container);
      expect(fixedFrame).not.toBe(firstFrame);
      expect(instances.every((observer) => observer.disconnected)).toBe(true);

      setAutoHeight(true);
      const secondFrame = iframeOf(rendered.container);
      expect(secondFrame).not.toBe(fixedFrame);
      await waitForTallFrame(rendered.container);

      rendered.unmount();
      expect(instances.every((observer) => observer.disconnected)).toBe(true);
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("disconnects the old observer before source-driven re-navigation", async () => {
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

    globalThis.ResizeObserver = TrackingResizeObserver;
    try {
      const [html, setHtml] = createSignal(TALL_HTML);
      const rendered = render(() => <ElmHtml html={html()} />);
      await waitForTallFrame(rendered.container);
      const iframe = iframeOf(rendered.container);
      const previousObservers = [...instances];

      setHtml('<div style="height:950px">replacement</div>');
      await vi.waitFor(
        () => {
          expect(iframe.contentDocument?.body.textContent).toContain(
            "replacement",
          );
          expect(parseInt(iframe.style.height, 10)).toBeGreaterThan(900);
        },
        { timeout: 3000 },
      );

      expect(iframeOf(rendered.container)).toBe(iframe);
      expect(previousObservers.every((observer) => observer.disconnected)).toBe(
        true,
      );
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("disconnects the previous observer when the framed document reloads itself", async () => {
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

    globalThis.ResizeObserver = TrackingResizeObserver;
    try {
      const rendered = render(() => <ElmHtml html={TALL_HTML} />);
      await waitForTallFrame(rendered.container);
      const iframe = iframeOf(rendered.container);
      const countBeforeReload = instances.length;

      iframe.contentWindow?.location.reload();
      await vi.waitFor(
        () => expect(instances.length).toBeGreaterThan(countBeforeReload),
        { timeout: 3000 },
      );

      expect(
        instances.slice(0, -1).every((observer) => observer.disconnected),
      ).toBe(true);
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("removes a script-mode message listener on branch disposal", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const [autoHeight, setAutoHeight] = createSignal(true);
    const rendered = render(() => (
      <ElmHtml
        html={SCRIPT_BUILT_HTML}
        allowScripts
        autoHeight={autoHeight()}
      />
    ));

    setAutoHeight(false);
    expect(
      remove.mock.calls.some(([eventName]) => eventName === "message"),
    ).toBe(true);

    rendered.unmount();
    remove.mockRestore();
  });
});

describe("[Browser] ElmHtml src and layout", () => {
  it("leaves an opaque src at its explicit height", async () => {
    const src = "data:text/html,<div style=%22height:900px%22>opaque</div>";
    const rendered = render(() => (
      <ElmHtml src={src} autoHeight height={200} />
    ));
    const iframe = iframeOf(rendered.container);

    await vi.waitFor(() => expect(iframe).toHaveAttribute("src", src));
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(iframe).toHaveAttribute("height", "200");
    expect(iframe.style.height).toBe("");
  });

  it("measures a same-origin Blob src", { retry: 2 }, async () => {
    const url = URL.createObjectURL(
      new Blob([TALL_HTML], { type: "text/html" }),
    );
    try {
      const rendered = render(() => <ElmHtml src={url} />);
      await waitForTallFrame(rendered.container);
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  it("fills its container and uses block layout by default", async () => {
    const rendered = render(() => (
      <div style={{ width: "500px" }}>
        <ElmHtml html="<p>x</p>" autoHeight={false} height={100} />
      </div>
    ));
    const iframe = iframeOf(rendered.container);

    await vi.waitFor(() => {
      expect(iframe.getBoundingClientRect().width).toBeCloseTo(500, 0);
      expect(getComputedStyle(iframe).display).toBe("block");
    });
  });
});
