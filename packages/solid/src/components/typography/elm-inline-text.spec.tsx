import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmInlineText } from "./elm-inline-text";

describe("[CSR] ElmInlineText", () => {
  it("forwards native span attributes while keeping semantic props private", () => {
    const onClick = vi.fn();
    let root: HTMLSpanElement | undefined;
    const { getByTestId } = render(() => (
      <ElmInlineText
        ref={(element) => {
          root = element;
        }}
        bold
        ruby="annotation"
        class="custom-text"
        data-testid="text"
        aria-label="Inline text"
        onClick={onClick}
      >
        base
      </ElmInlineText>
    ));
    const text = getByTestId("text");

    expect(text).toBe(root);
    expect(text).toHaveClass("custom-text");
    expect(text).toHaveAttribute("aria-label", "Inline text");
    expect(text).not.toHaveAttribute("bold");
    expect(text).not.toHaveAttribute("ruby");

    fireEvent.click(text);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("composes semantic wrappers in the established order", () => {
    const { container } = render(() => (
      <ElmInlineText
        href="https://example.com"
        kbd
        strikethrough
        italic
        underline
        bold
        code
      >
        text
      </ElmInlineText>
    ));

    const link = container.querySelector(
      "code > strong > ins > em > del > kbd > a",
    );
    expect(link).toHaveTextContent("text");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders ruby and only shows a favicon inside a link", () => {
    const { container } = render(() => (
      <>
        <ElmInlineText
          ruby="annotation"
          href="https://example.com"
          favicon="https://example.com/favicon.ico"
        >
          base
        </ElmInlineText>
        <ElmInlineText favicon="https://example.com/ignored.ico">
          plain
        </ElmInlineText>
      </>
    ));

    expect(container.querySelector("rt")).toHaveTextContent("annotation");
    expect(container.querySelector("a img")).toHaveAttribute(
      "src",
      "https://example.com/favicon.ico",
    );
    expect(container.querySelector("a img")).toHaveAttribute("alt", "favicon");
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("merges object and string styles with scoped variables", () => {
    const { getByTestId } = render(() => (
      <>
        <ElmInlineText
          data-testid="object-style"
          color="red"
          size="2em"
          backgroundColor="blue"
          style={{ "letter-spacing": "1px" }}
        >
          object
        </ElmInlineText>
        <ElmInlineText
          data-testid="string-style"
          color="green"
          style="font-weight: 600"
        >
          string
        </ElmInlineText>
      </>
    ));
    const objectStyle = getByTestId("object-style").style;
    const stringStyle = getByTestId("string-style").style;

    expect(objectStyle.letterSpacing).toBe("1px");
    expect(objectStyle.getPropertyValue("--elmethis-scoped-color")).toBe("red");
    expect(objectStyle.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "2em",
    );
    expect(
      objectStyle.getPropertyValue("--elmethis-scoped-background-color"),
    ).toBe("blue");
    expect(stringStyle.fontWeight).toBe("600");
    expect(stringStyle.getPropertyValue("--elmethis-scoped-color")).toBe(
      "green",
    );
  });

  it("reactively updates wrappers, link metadata, classes, styles, and children", () => {
    const [decorated, setDecorated] = createSignal(false);
    const [label, setLabel] = createSignal("before");
    const { container, getByTestId } = render(() => (
      <ElmInlineText
        data-testid="text"
        class={decorated() ? "decorated" : "plain"}
        bold={decorated()}
        code={decorated()}
        href={decorated() ? "https://example.com" : undefined}
        favicon={decorated() ? "https://example.com/favicon.ico" : undefined}
        ruby={decorated() ? "annotation" : undefined}
        color={decorated() ? "red" : "blue"}
      >
        {label()}
      </ElmInlineText>
    ));
    const root = getByTestId("text");

    expect(root).toHaveClass("plain");
    expect(root).toHaveTextContent("before");
    expect(container.querySelector("ruby")).toBeNull();

    setLabel("after");
    setDecorated(true);

    expect(root).toHaveClass("decorated");
    expect(root).not.toHaveClass("plain");
    expect(root).toHaveTextContent("after");
    expect(
      container.querySelector("ruby code > strong > a img"),
    ).not.toBeNull();
    expect(root.style.getPropertyValue("--elmethis-scoped-color")).toBe("red");

    setDecorated(false);
    expect(container.querySelector("ruby")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    expect(root).toHaveTextContent("after");
  });
});
