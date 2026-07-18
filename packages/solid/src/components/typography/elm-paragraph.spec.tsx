import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmParagraph } from "./elm-paragraph";

describe("[CSR] ElmParagraph", () => {
  it("reactively merges scoped styles and forwards native props and refs", () => {
    const [color, setColor] = createSignal("green");
    const [backgroundColor, setBackgroundColor] = createSignal("yellow");
    const [text, setText] = createSignal("paragraph text");
    let root: HTMLParagraphElement | undefined;
    const { getByTestId } = render(() => (
      <ElmParagraph
        ref={(element) => {
          root = element;
        }}
        color={color()}
        backgroundColor={backgroundColor()}
        class="custom-paragraph"
        style={{ "letter-spacing": "1px" }}
        data-testid="paragraph"
        aria-label="Paragraph"
      >
        {text()}
      </ElmParagraph>
    ));
    const paragraph = getByTestId("paragraph");

    expect(paragraph).toBe(root);
    expect(paragraph.tagName).toBe("P");
    expect(paragraph).toHaveClass("custom-paragraph");
    expect(paragraph).toHaveAttribute("aria-label", "Paragraph");
    expect(paragraph).not.toHaveAttribute("backgroundColor");
    expect(paragraph.style.letterSpacing).toBe("1px");
    expect(paragraph.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "green",
    );

    setColor("blue");
    setBackgroundColor("pink");
    setText("updated");

    expect(paragraph).toHaveTextContent("updated");
    expect(paragraph.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "blue",
    );
    expect(
      paragraph.style.getPropertyValue("--elmethis-scoped-background-color"),
    ).toBe("pink");
  });
});
