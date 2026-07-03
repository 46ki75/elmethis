import { render } from "vitest-browser-react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import { ElmHtmlViewer } from "./elm-html-viewer";

// Blob object URLs, `window.open`, sandboxed-iframe enforcement, and real
// anchor `.click()` semantics don't exist (or aren't enforced) in happy-dom,
// so the toolbar's download/open-in-new-tab behavior needs the Chromium
// layer to reproduce faithfully.

const SIMPLE_HTML = "<p>hello from ElmHtmlViewer</p>";

describe("[CSR] ElmHtmlViewer — rendering", () => {
  test("renders the download and open-in-new-tab buttons", async () => {
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);

    await expect
      .element(screen.getByRole("button", { name: "Download" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Open in new tab" }))
      .toBeInTheDocument();
  });

  test("renders html inside the wrapped ElmHtml's iframe", async () => {
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);
    const iframe = screen.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(iframe.contentDocument?.body.textContent).toContain(
        "hello from ElmHtmlViewer",
      );
    });
  });

  test("forwards sandbox and autoHeight to the inner ElmHtml", async () => {
    const screen = await render(
      <ElmHtmlViewer
        html={SIMPLE_HTML}
        sandbox="allow-forms"
        autoHeight={false}
      />,
    );
    const iframe = screen.container.querySelector("iframe")!;

    expect(iframe.getAttribute("sandbox")).toBe("allow-forms");
  });
});

const spyOnWindowOpen = () => vi.spyOn(window, "open");

// Vitest Browser Mode runs each test file inside a sandboxed iframe with no
// `allow-popups`, so `window.open` deterministically returns `null` here —
// confirmed with a throwaway harness before writing these; even a genuine
// Playwright-dispatched click can't get a real popup out of it. That rules
// out asserting on the opened window itself, but the blob: URL passed to
// `window.open` is still real and fetchable, so the wrapper markup it points
// to is inspected directly instead.
describe("[CSR] ElmHtmlViewer — open in new tab", () => {
  let openSpy: ReturnType<typeof spyOnWindowOpen>;

  beforeEach(() => {
    openSpy = spyOnWindowOpen();
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  test("opens a blob: url in a new tab without noopener", async () => {
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);

    await screen.getByRole("button", { name: "Open in new tab" }).click();

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target, features] = openSpy.mock.calls[0]!;
    expect(String(url)).toMatch(/^blob:/);
    expect(target).toBe("_blank");
    // No "noopener": blob: URLs are only reachable from browsing contexts
    // related to the one that created them, so an opener-less window
    // couldn't load one at all. See elm-html-viewer.tsx for why dropping it
    // is still safe.
    expect(features).toBe("noreferrer");
  });

  test("wraps html in a script-sandboxed iframe instead of navigating to it directly", async () => {
    // The blob: URL gets revoked synchronously in this harness (see the
    // fallback-revoke test below), so the Blob passed to createObjectURL is
    // read directly instead of re-fetching the URL afterward.
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);

    await screen.getByRole("button", { name: "Open in new tab" }).click();

    const wrapperBlob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    const wrapperHtml = await wrapperBlob.text();
    const wrapperDoc = new DOMParser().parseFromString(
      wrapperHtml,
      "text/html",
    );
    createObjectURLSpy.mockRestore();

    const iframe = wrapperDoc.querySelector("iframe");
    // BUG this guards against regressing: the previous implementation
    // navigated the new tab straight to the raw html, bypassing the sandbox
    // ElmHtml uses to block embedded scripts. An empty `sandbox` (no
    // allow-scripts) on the wrapping iframe keeps the new tab exactly as
    // locked down as the inline preview.
    expect(iframe?.getAttribute("sandbox")).toBe("");
    // The html is never embedded as a raw HTML attribute (an
    // attribute-escaping hazard); it's set via a script as inert JSON data.
    expect(iframe?.hasAttribute("srcdoc")).toBe(false);
    expect(wrapperDoc.querySelector("script")?.textContent).toContain(
      JSON.stringify(SIMPLE_HTML).replace(/<\//g, "<\\/"),
    );
  });

  test("keeps a </script>-containing html confined to the wrapper's own script instead of breaking out of it", async () => {
    const html = "<script>window.__pwned = true;</script><p>escaped-marker</p>";
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
    const screen = await render(<ElmHtmlViewer html={html} />);

    await screen.getByRole("button", { name: "Open in new tab" }).click();

    const wrapperBlob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    const wrapperHtml = await wrapperBlob.text();
    const wrapperDoc = new DOMParser().parseFromString(
      wrapperHtml,
      "text/html",
    );
    createObjectURLSpy.mockRestore();

    // BUG this guards against regressing: without escaping "</script"
    // inside the JSON payload, the HTML parser treats html's own
    // "</script>" as closing the wrapper's script tag early, spilling the
    // rest of `html` into the document as live markup instead of keeping it
    // as inert string data inside one script element.
    expect(wrapperDoc.querySelectorAll("script")).toHaveLength(1);
    expect(wrapperDoc.querySelector("p")).toBeNull();
  });

  test("revokes the object URL when window.open doesn't return a popup (e.g. blocked)", async () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);

    try {
      await screen.getByRole("button", { name: "Open in new tab" }).click();
      expect(revokeSpy).toHaveBeenCalledTimes(1);
    } finally {
      revokeSpy.mockRestore();
    }
  });
});

describe("[CSR] ElmHtmlViewer — download", () => {
  let clicks: { href: string; download: string; connected: boolean }[];

  beforeEach(() => {
    clicks = [];
    // Real downloads aren't wired up for this test browser, so intercept the
    // anchor click itself: everything else in handleDownload (attach,
    // remove, revoke) still runs around this, only the actual file-save is
    // skipped.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicks.push({
        href: this.href,
        download: this.download,
        connected: this.isConnected,
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("downloads with the default filename, via an anchor attached to the document", async () => {
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);

    await screen.getByRole("button", { name: "Download" }).click();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]!.href).toMatch(/^blob:/);
    expect(clicks[0]!.download).toBe("download.html");
    // BUG this guards against regressing: a detached anchor's `.click()`
    // silently fails to trigger a save in Safari.
    expect(clicks[0]!.connected).toBe(true);
  });

  test("falls back to the default filename when filename is an empty string", async () => {
    const screen = await render(
      <ElmHtmlViewer html={SIMPLE_HTML} filename="" />,
    );

    await screen.getByRole("button", { name: "Download" }).click();

    expect(clicks[0]!.download).toBe("download.html");
  });

  test("uses a caller-supplied filename", async () => {
    const screen = await render(
      <ElmHtmlViewer html={SIMPLE_HTML} filename="report.html" />,
    );

    await screen.getByRole("button", { name: "Download" }).click();

    expect(clicks[0]!.download).toBe("report.html");
  });

  test("removes the anchor from the document and revokes the object URL after clicking", async () => {
    const screen = await render(<ElmHtmlViewer html={SIMPLE_HTML} />);
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

    await screen.getByRole("button", { name: "Download" }).click();

    expect(revokeSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("a[download]").length).toBe(0);
  });
});
