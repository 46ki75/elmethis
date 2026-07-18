import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

vi.mock("../code/elm-shiki-highlighter", () => ({
  ElmShikiHighlighter: (props: { code: string; language: string }) => (
    <pre data-language={props.language}>{props.code}</pre>
  ),
}));

import { ElmMarkdown } from "./elm-markdown";

describe("[CSR] ElmMarkdown token rendering", () => {
  it("renders block and inline typography", () => {
    const rendered = render(() => (
      <ElmMarkdown
        markdown={`# Heading

Paragraph with **bold**, *italic*, ~~deleted~~, \`code\`, and a [link](https://example.com).

> Quoted text

- one
- two

1. first
2. second

---`}
      />
    ));

    expect(rendered.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Heading",
    );
    expect(rendered.container.querySelector("strong")).toHaveTextContent(
      "bold",
    );
    expect(rendered.container.querySelector("em")).toHaveTextContent("italic");
    expect(rendered.container.querySelector("del")).toHaveTextContent(
      "deleted",
    );
    expect(rendered.container.querySelector("code")).toHaveTextContent("code");
    expect(rendered.getByRole("link", { name: "link" })).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(rendered.container.querySelector("blockquote")).toHaveTextContent(
      "Quoted text",
    );
    expect(rendered.container.querySelector("ul")).not.toBeNull();
    expect(rendered.container.querySelector("ol")).not.toBeNull();
    expect(rendered.container.querySelector("hr")).not.toBeNull();
  });

  it("renders block images, fenced code, and GFM tables", () => {
    const rendered = render(() => (
      <ElmMarkdown
        markdown={`![diagram](https://example.com/diagram.png)

\`\`\`typescript
const value = 1;
\`\`\`

| Name | Value |
| --- | ---: |
| Solid | 1 |`}
      />
    ));

    expect(rendered.getByRole("img", { name: "diagram" })).toHaveAttribute(
      "src",
      "https://example.com/diagram.png",
    );
    expect(rendered.container.querySelector("figure")).not.toBeNull();
    expect(rendered.container.textContent).toContain("typescript");
    expect(rendered.container.textContent).toContain("const value = 1;");
    expect(rendered.container.querySelector("table")).not.toBeNull();
    expect(rendered.container.querySelectorAll("th")).toHaveLength(2);
    expect(rendered.container.querySelectorAll("td")).toHaveLength(2);
    expect(rendered.container.textContent).toContain("Solid");
  });

  it("ignores raw HTML instead of injecting it", () => {
    const rendered = render(() => (
      <ElmMarkdown
        markdown={
          'Before\n\n<script data-unsafe="true">alert(1)</script>\n\nAfter'
        }
      />
    ));

    expect(rendered.container.querySelector("script")).toBeNull();
    expect(rendered.container.textContent).not.toContain("alert(1)");
    expect(rendered.container.textContent).toContain("Before");
    expect(rendered.container.textContent).toContain("After");
  });

  it("forwards root attributes and reacts to markdown and class changes", () => {
    const [markdown, setMarkdown] = createSignal("First");
    const [className, setClassName] = createSignal("initial");
    const rendered = render(() => (
      <ElmMarkdown
        markdown={markdown()}
        class={className()}
        data-testid="markdown"
      />
    ));

    setMarkdown("# Updated");
    setClassName("updated-class");

    expect(rendered.getByTestId("markdown")).toHaveClass("updated-class");
    expect(rendered.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Updated",
    );
    expect(rendered.container.textContent).not.toContain("First");
  });
});

describe("[CSR] ElmMarkdown streaming identity", () => {
  it("keeps completed prefix nodes mounted while replacing the changing tail", () => {
    const [markdown, setMarkdown] = createSignal(
      "Completed paragraph\n\nTail begins",
    );
    const rendered = render(() => (
      <ElmMarkdown markdown={markdown()} isStreaming />
    ));
    const completed = rendered.getByText("Completed paragraph").closest("p")!;
    const oldTail = rendered.getByText("Tail begins").closest("p")!;

    setMarkdown("Completed paragraph\n\nTail begins and grows");

    expect(rendered.getByText("Completed paragraph").closest("p")).toBe(
      completed,
    );
    expect(rendered.getByText("Tail begins and grows").closest("p")).not.toBe(
      oldTail,
    );
    expect(oldTail.isConnected).toBe(false);
  });

  it("retains old completed nodes as additional blocks become stable", () => {
    const [markdown, setMarkdown] = createSignal("First stable\n\nSecond tail");
    const rendered = render(() => (
      <ElmMarkdown markdown={markdown()} isStreaming />
    ));
    const first = rendered.getByText("First stable").closest("p")!;

    setMarkdown("First stable\n\nSecond completed\n\nThird tail");

    expect(rendered.getByText("First stable").closest("p")).toBe(first);
    expect(rendered.container.textContent).toContain("Second completed");
    expect(rendered.container.textContent).toContain("Third tail");
  });

  it("invalidates the stable cache when streaming content is edited or reset", () => {
    const [markdown, setMarkdown] = createSignal("Old prefix\n\nTail");
    const rendered = render(() => (
      <ElmMarkdown markdown={markdown()} isStreaming />
    ));
    const oldPrefix = rendered.getByText("Old prefix").closest("p")!;

    setMarkdown("New prefix\n\nTail");

    expect(rendered.container.textContent).not.toContain("Old prefix");
    expect(rendered.getByText("New prefix").closest("p")).not.toBe(oldPrefix);
    expect(oldPrefix.isConnected).toBe(false);
  });
});
