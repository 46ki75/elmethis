import { render } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmTemplate } from "./elm-template";
import styles from "./elm-template.module.css";

describe("[CSR] ElmTemplate", () => {
  it("renders reactive children and forwards native attributes and classes", () => {
    const [text, setText] = createSignal("Template content");
    const [className, setClassName] = createSignal("initial");
    const rendered = render(() => (
      <ElmTemplate data-testid="template" class={className()} title={text()}>
        {text()}
      </ElmTemplate>
    ));
    const template = rendered.getByTestId("template");

    expect(template).toHaveTextContent("Template content");
    expect(template).toHaveAttribute("title", "Template content");
    expect(template).toHaveClass(styles["elm-template"], "initial");

    setText("Updated content");
    setClassName("updated");
    flush();

    expect(template).toHaveTextContent("Updated content");
    expect(template).toHaveAttribute("title", "Updated content");
    expect(template).toHaveClass(styles["elm-template"], "updated");
    expect(template).not.toHaveClass("initial");
  });
});
