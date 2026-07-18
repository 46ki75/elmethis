import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmHtml, type ElmHtmlProps } from "./elm-html";

const REMOTE_SRC = "data:text/html,<p>remote</p>";

const iframeOf = (container: HTMLElement) =>
  container.querySelector("iframe") as HTMLIFrameElement;

describe("[CSR] ElmHtml rendering", () => {
  it("preserves explicit native and object-style heights before measurement", () => {
    const native = render(() => <ElmHtml html="<p>native</p>" height={400} />);
    const styled = render(() => (
      <ElmHtml html="<p>styled</p>" style={{ height: "320px" }} />
    ));

    expect(iframeOf(native.container).getAttribute("height")).toBe("400");
    expect(iframeOf(styled.container).style.height).toBe("320px");
  });

  it("preserves string styles without parsing or corrupting CSS values", () => {
    const { container } = render(() => (
      <ElmHtml
        html="<p>x</p>"
        // eslint-disable-next-line solid/style-prop
        style="background-image:url(data:image/svg+xml;base64,AAAA);height:275px"
      />
    ));
    const iframe = iframeOf(container);

    expect(iframe.style.backgroundImage).toContain(
      "data:image/svg+xml;base64,AAAA",
    );
    expect(iframe.style.height).toBe("275px");
  });

  it("merges class, forwards native attributes and refs, and supplies a title", () => {
    let frame: HTMLIFrameElement | undefined;
    const { container } = render(() => (
      <ElmHtml
        ref={(element) => (frame = element)}
        html="<p>x</p>"
        class="custom-frame"
        data-kind="artifact"
        allow="fullscreen"
      />
    ));
    const iframe = iframeOf(container);

    expect(iframe).toBe(frame);
    expect(iframe).toHaveClass("custom-frame");
    expect(iframe).toHaveAttribute("data-kind", "artifact");
    expect(iframe).toHaveAttribute("allow", "fullscreen");
    expect(iframe).toHaveAttribute("title", "Embedded HTML content");
  });
});

describe("[CSR] ElmHtml source precedence and protected attributes", () => {
  it("uses src without ever emitting srcdoc, while inline mode never emits src", () => {
    const remote = render(() => <ElmHtml src={REMOTE_SRC} />);
    const inline = render(() => <ElmHtml html="<p>inline</p>" />);

    expect(iframeOf(remote.container)).toHaveAttribute("src", REMOTE_SRC);
    expect(iframeOf(remote.container)).not.toHaveAttribute("srcdoc");
    expect(iframeOf(inline.container)).not.toHaveAttribute("src");
    expect(iframeOf(inline.container)).toHaveAttribute(
      "srcdoc",
      "<p>inline</p>",
    );
  });

  it("lets src win when both source forms are supplied", () => {
    const { container } = render(() => (
      <ElmHtml
        {...({ html: "<p>inline</p>", src: REMOTE_SRC } as ElmHtmlProps)}
      />
    ));
    const iframe = iframeOf(container);

    expect(iframe).toHaveAttribute("src", REMOTE_SRC);
    expect(iframe).not.toHaveAttribute("srcdoc");
  });

  it.each(["srcDoc", "srcdoc", "Srcdoc", "SRCDOC"])(
    "rejects a smuggled %s override",
    (name) => {
      const props = {
        html: "<p>trusted</p>",
        [name]: "<p>injected</p>",
      } as unknown as ElmHtmlProps;
      const { container } = render(() => <ElmHtml {...props} />);

      expect(iframeOf(container)).toHaveAttribute("srcdoc", "<p>trusted</p>");
    },
  );

  it.each(["Src", "SRC"])("rejects a smuggled %s override", (name) => {
    const props = {
      html: "<p>trusted</p>",
      [name]: REMOTE_SRC,
    } as unknown as ElmHtmlProps;
    const { container } = render(() => <ElmHtml {...props} />);

    expect(iframeOf(container)).not.toHaveAttribute("src");
    expect(iframeOf(container)).toHaveAttribute("srcdoc", "<p>trusted</p>");
  });

  it.each(["referrerpolicy", "ReferrerPolicy", "REFERRERPOLICY"])(
    "protects no-referrer from a smuggled %s override",
    (name) => {
      const props = {
        src: `${REMOTE_SRC}?token=secret`,
        [name]: "unsafe-url",
      } as unknown as ElmHtmlProps;
      const { container } = render(() => <ElmHtml {...props} />);

      expect(iframeOf(container)).toHaveAttribute(
        "referrerpolicy",
        "no-referrer",
      );
    },
  );

  it("does not force a referrer policy for inline content", () => {
    const { container } = render(() => <ElmHtml html="<p>x</p>" />);

    expect(iframeOf(container)).not.toHaveAttribute("referrerpolicy");
  });
});

describe("[CSR] ElmHtml sandbox normalization", () => {
  it.each(["allow-scripts", "Allow-Scripts", "ALLOW-SCRIPTS"])(
    "never combines %s with allow-same-origin",
    (token) => {
      const { container } = render(() => (
        <ElmHtml
          html="<p>x</p>"
          sandbox={`${token} ALLOW-SAME-ORIGIN allow-forms`}
        />
      ));
      const tokens =
        iframeOf(container)
          .getAttribute("sandbox")
          ?.toLowerCase()
          .split(/\s+/) ?? [];

      expect(tokens).toContain("allow-scripts");
      expect(tokens).toContain("allow-forms");
      expect(tokens).not.toContain("allow-same-origin");
    },
  );

  it("enforces the unsafe-token strip even when autoHeight is off", () => {
    const { container } = render(() => (
      <ElmHtml
        html="<p>x</p>"
        autoHeight={false}
        sandbox="allow-scripts allow-same-origin"
      />
    ));

    expect(iframeOf(container).getAttribute("sandbox")?.split(/\s+/)).toEqual([
      "allow-scripts",
    ]);
  });

  it("adds only the privilege needed by the selected behavior", () => {
    const automatic = render(() => <ElmHtml html="<p>x</p>" />);
    const fixed = render(() => <ElmHtml html="<p>x</p>" autoHeight={false} />);
    const scripted = render(() => <ElmHtml html="<p>x</p>" allowScripts />);

    expect(iframeOf(automatic.container).getAttribute("sandbox")).toContain(
      "allow-same-origin",
    );
    expect(iframeOf(fixed.container).getAttribute("sandbox")).toBe("");
    expect(iframeOf(scripted.container).getAttribute("sandbox")).toBe(
      "allow-scripts",
    );
  });

  it("protects the normalized sandbox from differently-cased props", () => {
    const props = {
      html: "<p>x</p>",
      sandbox: "allow-forms",
      Sandbox: "allow-scripts allow-same-origin",
    } as unknown as ElmHtmlProps;
    const { container } = render(() => <ElmHtml {...props} />);

    expect(iframeOf(container).getAttribute("sandbox")?.split(/\s+/)).toEqual([
      "allow-forms",
      "allow-same-origin",
    ]);
  });
});

describe("[CSR] ElmHtml reactivity and lifecycle ownership", () => {
  it("reactively navigates between inline and src modes without src=empty", () => {
    const [src, setSrc] = createSignal<string>();
    const [html, setHtml] = createSignal("<p>first</p>");
    const { container } = render(() => (
      <ElmHtml html={html()} src={src()} autoHeight={false} />
    ));
    const iframe = iframeOf(container);

    setHtml("<p>second</p>");
    expect(iframe).toHaveAttribute("srcdoc", "<p>second</p>");
    expect(iframe).not.toHaveAttribute("src");

    setSrc(REMOTE_SRC);
    expect(iframeOf(container)).toBe(iframe);
    expect(iframe).toHaveAttribute("src", REMOTE_SRC);
    expect(iframe).not.toHaveAttribute("srcdoc");

    setSrc(undefined);
    expect(iframe).not.toHaveAttribute("src");
    expect(iframe).toHaveAttribute("srcdoc", "<p>second</p>");
  });

  it("recreates the iframe when autoHeight changes instead of relying on key", () => {
    const [autoHeight, setAutoHeight] = createSignal(false);
    const { container } = render(() => (
      <ElmHtml html="<p>x</p>" autoHeight={autoHeight()} />
    ));
    const fixedFrame = iframeOf(container);

    setAutoHeight(true);
    const automaticFrame = iframeOf(container);
    expect(automaticFrame).not.toBe(fixedFrame);
    expect(automaticFrame.getAttribute("sandbox")).toContain(
      "allow-same-origin",
    );

    setAutoHeight(false);
    expect(iframeOf(container)).not.toBe(automaticFrame);
  });

  it("removes its namespaced message listener on source changes and unmount", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const [html, setHtml] = createSignal("<p>first</p>");
    const rendered = render(() => <ElmHtml html={html()} allowScripts />);

    const firstListener = add.mock.calls.find(
      ([name]) => name === "message",
    )?.[1];
    expect(firstListener).toBeTypeOf("function");

    setHtml("<p>second</p>");
    expect(remove).toHaveBeenCalledWith("message", firstListener);

    const currentListener = add.mock.calls
      .filter(([name]) => name === "message")
      .at(-1)?.[1];
    rendered.unmount();
    expect(remove).toHaveBeenCalledWith("message", currentListener);

    add.mockRestore();
    remove.mockRestore();
  });
});
