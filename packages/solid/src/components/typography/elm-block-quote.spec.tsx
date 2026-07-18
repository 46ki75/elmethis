import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmBlockQuote } from "./elm-block-quote";

describe("[CSR] ElmBlockQuote", () => {
  it("renders its body and icons while forwarding reactive native props", () => {
    const [className, setClassName] = createSignal("before");
    const [text, setText] = createSignal("quoted");
    let root: HTMLQuoteElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmBlockQuote
        ref={(element) => {
          root = element;
        }}
        class={className()}
        cite="https://example.com/source"
        data-testid="quote"
      >
        {text()}
      </ElmBlockQuote>
    ));
    const quote = getByTestId("quote");

    expect(quote).toBe(root);
    expect(quote).toHaveAttribute("cite", "https://example.com/source");
    expect(quote).toHaveClass("before");
    expect(quote).toHaveTextContent("quoted");
    expect(container.querySelectorAll("svg")).toHaveLength(2);

    setClassName("after");
    setText("updated");

    expect(quote).not.toHaveClass("before");
    expect(quote).toHaveClass("after");
    expect(quote).toHaveTextContent("updated");
  });
});
