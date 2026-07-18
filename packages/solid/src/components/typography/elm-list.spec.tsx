import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmList } from "./elm-list";

describe("[CSR] ElmList", () => {
  it("reactively switches list semantics and forwards native props and refs", () => {
    const [ordered, setOrdered] = createSignal(false);
    const [className, setClassName] = createSignal("before");
    let root: HTMLUListElement | HTMLOListElement | undefined;
    const { getByTestId } = render(() => (
      <ElmList
        ref={(element) => {
          root = element;
        }}
        listStyle={ordered() ? "ordered" : "unordered"}
        type={ordered() ? "A" : undefined}
        class={className()}
        data-testid="list"
        aria-label="Items"
      >
        <li>alpha</li>
        <li>beta</li>
      </ElmList>
    ));

    let list = getByTestId("list");
    expect(list).toBe(root);
    expect(list.tagName).toBe("UL");
    expect(list).toHaveTextContent("alphabeta");
    expect(list).toHaveAttribute("aria-label", "Items");

    setOrdered(true);
    setClassName("after");

    list = getByTestId("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("type", "A");
    expect(list).toHaveClass("after");
  });
});
