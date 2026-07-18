import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmHtmlViewer } from "./elm-html-viewer";

describe("[CSR] ElmHtmlViewer", () => {
  it("renders its controls, merges class, and forwards figure props and refs", () => {
    let figure: HTMLElement | undefined;
    const rendered = render(() => (
      <ElmHtmlViewer
        ref={(element) => (figure = element)}
        html="<p>hello</p>"
        class="custom-viewer"
        style={{ "max-width": "700px" }}
        data-kind="viewer"
      />
    ));
    const root = rendered.container.querySelector("figure")!;

    expect(root).toBe(figure);
    expect(root).toHaveClass("custom-viewer");
    expect(root).toHaveAttribute("data-kind", "viewer");
    expect(root).toHaveStyle({ maxWidth: "700px" });
    expect(rendered.getByRole("button", { name: "Download" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(
      rendered.getByRole("button", { name: "Open in new tab" }),
    ).toBeInTheDocument();
  });

  it("forwards preview behavior and src precedence to ElmHtml", () => {
    const { container } = render(() => (
      <ElmHtmlViewer
        html="<p>inline</p>"
        src="data:text/html,<p>remote</p>"
        sandbox="allow-forms"
        autoHeight={false}
        allowScripts
        height={600}
      />
    ));
    const iframe = container.querySelector("iframe")!;

    expect(iframe).toHaveAttribute("src", "data:text/html,<p>remote</p>");
    expect(iframe).not.toHaveAttribute("srcdoc");
    expect(iframe).toHaveAttribute("height", "600");
    expect(iframe.getAttribute("sandbox")?.split(/\s+/)).toEqual([
      "allow-forms",
      "allow-scripts",
    ]);
  });

  it("reactively updates the preview source without recreating the viewer", () => {
    const [src, setSrc] = createSignal<string>();
    const [html, setHtml] = createSignal("<p>first</p>");
    const { container } = render(() => (
      <ElmHtmlViewer html={html()} src={src()} autoHeight={false} />
    ));
    const figure = container.querySelector("figure")!;
    const iframe = container.querySelector("iframe")!;

    setHtml("<p>second</p>");
    expect(iframe).toHaveAttribute("srcdoc", "<p>second</p>");

    setSrc("data:text/html,<p>remote</p>");
    expect(container.querySelector("figure")).toBe(figure);
    expect(container.querySelector("iframe")).toBe(iframe);
    expect(iframe).toHaveAttribute("src", "data:text/html,<p>remote</p>");
  });
});
