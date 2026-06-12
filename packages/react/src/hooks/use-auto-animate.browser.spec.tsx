import { useState } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { useAutoAnimate } from "./use-auto-animate";

// `useAutoAnimate` is browser-only by nature: it hands the real container
// element to `@formkit/auto-animate`, which wires a `MutationObserver` and
// reads layout via `getBoundingClientRect`. None of that is faithful under
// jsdom/happy-dom — there is no node-layer spec, so this is the hook's only
// real coverage.

const Harness = () => {
  const { ref } = useAutoAnimate<HTMLUListElement>();
  const [items, setItems] = useState<number[]>([1, 2, 3]);
  return (
    <div>
      <button
        data-testid="add"
        onClick={() => {
          setItems((prev) => [...prev, prev.length + 1]);
        }}
      >
        Add
      </button>
      <ul data-testid="container" ref={ref}>
        {items.map((item) => (
          <li key={item} data-testid="item">
            Item {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe("[CSR] useAutoAnimate", () => {
  test("attaches the animation controller to the container after mount", async () => {
    const screen = await render(<Harness />);

    // The effect must have run and `autoAnimate()` attached to the real
    // container — auto-animate marks the host element via inline styles
    // (`position`), which is precisely what jsdom cannot produce.
    await vi.waitFor(() => {
      const container = screen
        .getByTestId("container")
        .element() as HTMLElement;
      expect(container.style.position).toBe("relative");
    });
  });

  test("the animated container still renders and grows its children", async () => {
    const screen = await render(<Harness />);
    await vi.waitFor(() => {
      const container = screen
        .getByTestId("container")
        .element() as HTMLElement;
      expect(container.style.position).toBe("relative");
    });

    expect(document.querySelectorAll('[data-testid="item"]')).toHaveLength(3);

    await screen.getByTestId("add").click();

    // Attaching auto-animate to the container must not break normal React
    // re-render of the list.
    await vi.waitFor(() =>
      expect(document.querySelectorAll('[data-testid="item"]')).toHaveLength(4),
    );
  });
});
