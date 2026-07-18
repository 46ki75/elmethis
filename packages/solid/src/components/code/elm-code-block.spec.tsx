import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

vi.mock("./elm-shiki-highlighter", () => ({
  ElmShikiHighlighter: (props: { code: string; language: string }) => (
    <pre data-testid="highlighter" data-language={props.language}>
      {props.code}
    </pre>
  ),
}));

import { ElmCodeBlock } from "./elm-code-block";

describe("[CSR] ElmCodeBlock", () => {
  it("composes the language icon, caption fallback, highlighter, and copy control", () => {
    const rendered = render(() => (
      <ElmCodeBlock code="let x = 1;" language="rust" />
    ));

    expect(rendered.container.querySelector("figure")).not.toBeNull();
    expect(rendered.container.textContent).toContain("rust");
    expect(rendered.getByTestId("highlighter")).toHaveAttribute(
      "data-language",
      "rust",
    );
    expect(rendered.getByTestId("highlighter")).toHaveTextContent("let x = 1;");
    expect(
      rendered.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeInTheDocument();
    expect(
      rendered.container.querySelectorAll("svg").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("uses an explicit caption, renders children, and forwards figure attributes", () => {
    const rendered = render(() => (
      <ElmCodeBlock
        code="x"
        language="python"
        caption="script.py: "
        class="custom-block"
        data-testid="block"
      >
        details
      </ElmCodeBlock>
    ));

    const block = rendered.getByTestId("block");
    expect(block).toHaveClass("custom-block");
    expect(block).toHaveTextContent("script.py: details");
  });

  it("reactively updates code, language, and caption", () => {
    const [code, setCode] = createSignal("old");
    const [language, setLanguage] = createSignal("txt");
    const [caption, setCaption] = createSignal<string>();
    const rendered = render(() => (
      <ElmCodeBlock code={code()} language={language()} caption={caption()} />
    ));

    setCode("new");
    setLanguage("typescript");
    setCaption("main.ts");

    expect(rendered.getByTestId("highlighter")).toHaveTextContent("new");
    expect(rendered.getByTestId("highlighter")).toHaveAttribute(
      "data-language",
      "typescript",
    );
    expect(rendered.container.textContent).toContain("main.ts");
  });
});
