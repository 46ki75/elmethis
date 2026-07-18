import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmHeading, type ElmHeadingLevel } from "./elm-heading";

describe("[CSR] ElmHeading", () => {
  it("reactively renders its level, content, fragment, styles, and native props", () => {
    const [level, setLevel] = createSignal<ElmHeadingLevel>(1);
    const [id, setId] = createSignal<string>();
    const [text, setText] = createSignal("Title");
    let root: HTMLHeadingElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmHeading
        ref={(element) => {
          root = element;
        }}
        level={level()}
        id={id()}
        text={text()}
        class="custom-heading"
        style={{ "letter-spacing": "1px" }}
        data-testid="heading"
      >
        child
      </ElmHeading>
    ));

    let heading = getByTestId("heading");
    expect(heading).toBe(root);
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveTextContent("Titlechild");
    expect(heading).toHaveClass("custom-heading");
    expect(heading.style.letterSpacing).toBe("1px");
    expect(heading.style.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "1.5em",
    );
    expect(container).not.toHaveTextContent("#");

    setLevel(2);
    setId("section");
    setText("Updated");

    heading = getByTestId("heading");
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveAttribute("id", "section");
    expect(heading).toHaveTextContent("Updatedchild#");
    expect(heading.style.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "1.4em",
    );
    expect(heading.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
