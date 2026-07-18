import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal, type Accessor } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { RenderIndexedChild } from "./render-indexed-child";

describe("[CSR] RenderIndexedChild", () => {
  it("updates the child index without replacing its subtree", () => {
    const [index, setIndex] = createSignal(0);
    const renderChild = vi.fn(
      (
        _id: string,
        _basePath?: string,
        childIndex?: number | Accessor<number>,
      ) => (
        <div>
          <span data-index>
            {typeof childIndex === "function" ? childIndex() : childIndex}
          </span>
          <input aria-label="Draft" />
        </div>
      ),
    );
    const rendered = render(() => (
      <RenderIndexedChild
        child={{ id: "child", basePath: "/items" }}
        index={index}
        renderChild={renderChild}
      />
    ));
    const input = rendered.getByRole("textbox", { name: "Draft" });
    fireEvent.input(input, { target: { value: "in progress" } });

    setIndex(1);

    expect(rendered.container.querySelector("[data-index]")).toHaveTextContent(
      "1",
    );
    expect(rendered.getByRole("textbox", { name: "Draft" })).toBe(input);
    expect(input).toHaveValue("in progress");
    expect(renderChild).toHaveBeenCalledOnce();
  });
});
