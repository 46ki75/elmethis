import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmCallout, type AlertType } from "./elm-callout";

describe("[CSR] ElmCallout", () => {
  it("defaults to note and reactively updates its type and native props", () => {
    const [type, setType] = createSignal<AlertType>();
    const [className, setClassName] = createSignal("before");
    let root: HTMLElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmCallout
        ref={(element) => {
          root = element;
        }}
        type={type()}
        class={className()}
        data-testid="callout"
        aria-label="Status"
      >
        callout body
      </ElmCallout>
    ));
    const callout = getByTestId("callout");
    const initialPath = container.querySelector("path")?.getAttribute("d");

    expect(callout).toBe(root);
    expect(callout.tagName).toBe("ASIDE");
    expect(callout).toHaveTextContent("notecallout body");
    expect(callout).toHaveAttribute("aria-label", "Status");
    expect(callout).not.toHaveAttribute("type");

    setType("warning");
    setClassName("after");

    expect(callout).toHaveTextContent("warningcallout body");
    expect(callout).toHaveClass("after");
    expect(container.querySelector("path")?.getAttribute("d")).not.toBe(
      initialPath,
    );
  });
});
