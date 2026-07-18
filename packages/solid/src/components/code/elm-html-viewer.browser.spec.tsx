import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmHtmlViewer } from "./elm-html-viewer";

const SIMPLE_HTML = "<p>hello from ElmHtmlViewer</p>";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("[Browser] ElmHtmlViewer preview", () => {
  it("renders inline content and forwards sandbox behavior", async () => {
    const rendered = render(() => <ElmHtmlViewer html={SIMPLE_HTML} />);
    const iframe = rendered.container.querySelector("iframe")!;

    await vi.waitFor(() => {
      expect(iframe.contentDocument?.body.textContent ?? "").toContain(
        "hello from ElmHtmlViewer",
      );
    });

    const fixed = render(() => (
      <ElmHtmlViewer
        html={SIMPLE_HTML}
        sandbox="allow-forms"
        autoHeight={false}
      />
    ));
    expect(fixed.container.querySelector("iframe")).toHaveAttribute(
      "sandbox",
      "allow-forms",
    );
  });

  it("preserves a direct remote source and explicit height", () => {
    const rendered = render(() => (
      <ElmHtmlViewer
        src="https://example.com/doc.html"
        allowScripts
        height={600}
      />
    ));
    const iframe = rendered.container.querySelector("iframe")!;

    expect(iframe).toHaveAttribute("src", "https://example.com/doc.html");
    expect(iframe).not.toHaveAttribute("srcdoc");
    expect(iframe).toHaveAttribute("height", "600");
    expect(iframe).toHaveAttribute("referrerpolicy", "no-referrer");
  });
});

describe("[Browser] ElmHtmlViewer open in new tab", () => {
  it("opens a noreferrer Blob wrapper with an empty-sandbox iframe", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={SIMPLE_HTML} />);

    rendered.getByRole("button", { name: "Open in new tab" }).click();

    expect(open).toHaveBeenCalledTimes(1);
    const [url, target, features] = open.mock.calls[0]!;
    expect(String(url)).toMatch(/^blob:/);
    expect(target).toBe("_blank");
    expect(features).toBe("noreferrer");

    const blob = createObjectUrl.mock.calls[0]![0] as Blob;
    const wrapper = await blob.text();
    const document = new DOMParser().parseFromString(wrapper, "text/html");
    const iframe = document.querySelector("iframe");

    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("Embedded HTML content");
    expect(iframe?.getAttribute("sandbox")).toBe("");
    expect(iframe?.getAttribute("title")).toBe("Embedded HTML content");
    expect(iframe).not.toHaveAttribute("srcdoc");
    expect(document.querySelector("script")?.textContent).toContain(
      JSON.stringify(SIMPLE_HTML).replace(/<\//g, "<\\/"),
    );
  });

  it("keeps caller </script> text confined to the wrapper script", async () => {
    const dangerous =
      "<script>window.__escaped = true;</script><p>escaped-marker</p>";
    vi.spyOn(window, "open").mockReturnValue(null);
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={dangerous} />);

    rendered.getByRole("button", { name: "Open in new tab" }).click();

    const blob = createObjectUrl.mock.calls[0]![0] as Blob;
    const wrapper = await blob.text();
    const document = new DOMParser().parseFromString(wrapper, "text/html");

    expect(document.querySelectorAll("script")).toHaveLength(1);
    expect(document.querySelector("p")).toBeNull();
  });

  it("revokes immediately when a popup is blocked", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={SIMPLE_HTML} />);

    rendered.getByRole("button", { name: "Open in new tab" }).click();

    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("revokes a popup URL on load and only once", () => {
    let onLoad: EventListener | undefined;
    const popup = {
      addEventListener: vi.fn(
        (_name: string, listener: EventListenerOrEventListenerObject) => {
          onLoad =
            typeof listener === "function"
              ? listener
              : listener.handleEvent.bind(listener);
        },
      ),
    } as unknown as Window;
    vi.spyOn(window, "open").mockReturnValue(popup);
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={SIMPLE_HTML} />);

    rendered.getByRole("button", { name: "Open in new tab" }).click();
    expect(revoke).not.toHaveBeenCalled();

    onLoad?.(new Event("load"));
    onLoad?.(new Event("load"));
    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("revokes a still-pending popup URL when the viewer unmounts", () => {
    const popup = {
      addEventListener: vi.fn(),
    } as unknown as Window;
    vi.spyOn(window, "open").mockReturnValue(popup);
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={SIMPLE_HTML} />);

    rendered.getByRole("button", { name: "Open in new tab" }).click();
    rendered.unmount();

    expect(revoke).toHaveBeenCalledTimes(1);
  });

  it("opens the current src directly without allocating a Blob", () => {
    const [src, setSrc] = createSignal("https://example.com/old.html");
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => <ElmHtmlViewer src={src()} />);

    setSrc("https://example.com/current.html");
    rendered.getByRole("button", { name: "Open in new tab" }).click();

    expect(open).toHaveBeenCalledWith(
      "https://example.com/current.html",
      "_blank",
      "noreferrer",
    );
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("serializes the current inline HTML at click time", async () => {
    const [html, setHtml] = createSignal("<p>old</p>");
    vi.spyOn(window, "open").mockReturnValue(null);
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={html()} />);

    setHtml("<p>current</p>");
    rendered.getByRole("button", { name: "Open in new tab" }).click();

    const blob = createObjectUrl.mock.calls[0]![0] as Blob;
    expect(await blob.text()).toContain("<p>current<\\/p>");
    expect(await blob.text()).not.toContain("<p>old<\\/p>");
  });
});

describe("[Browser] ElmHtmlViewer download", () => {
  const captureClicks = () => {
    const clicks: { href: string; download: string; connected: boolean }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicks.push({
        href: this.href,
        download: this.download,
        connected: this.isConnected,
      });
    });
    return clicks;
  };

  it.each([
    [undefined, "download.html"],
    ["", "download.html"],
    ["report.html", "report.html"],
  ])("uses filename %s as %s", (filename, expected) => {
    const clicks = captureClicks();
    const rendered = render(() => (
      <ElmHtmlViewer html={SIMPLE_HTML} filename={filename} />
    ));

    rendered.getByRole("button", { name: "Download" }).click();

    expect(clicks).toHaveLength(1);
    expect(clicks[0]!.href).toMatch(/^blob:/);
    expect(clicks[0]!.download).toBe(expected);
    expect(clicks[0]!.connected).toBe(true);
  });

  it("removes the anchor and revokes the inline Blob after clicking", () => {
    captureClicks();
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={SIMPLE_HTML} />);

    rendered.getByRole("button", { name: "Download" }).click();

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("uses the current src directly and documents the filename as a browser hint", () => {
    const clicks = captureClicks();
    const [src, setSrc] = createSignal("https://example.com/old.html");
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => (
      <ElmHtmlViewer src={src()} filename="suggested.html" />
    ));

    setSrc("https://example.com/current.html");
    rendered.getByRole("button", { name: "Download" }).click();

    expect(clicks).toEqual([
      {
        href: "https://example.com/current.html",
        download: "suggested.html",
        connected: true,
      },
    ]);
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("places the current inline source in the downloaded Blob", async () => {
    captureClicks();
    const [html, setHtml] = createSignal("<p>old</p>");
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => <ElmHtmlViewer html={html()} />);

    setHtml("<p>current</p>");
    rendered.getByRole("button", { name: "Download" }).click();

    const blob = createObjectUrl.mock.calls[0]![0] as Blob;
    expect(await blob.text()).toBe("<p>current</p>");
  });
});
