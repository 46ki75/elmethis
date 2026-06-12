import { component$, useStore } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { useAutoAnimate } from "./use-auto-animate";

// `useAutoAnimate` is browser-only by nature: its `useVisibleTask$` hands the
// real container element to `@formkit/auto-animate`, which wires a
// `MutationObserver` and reads layout via `getBoundingClientRect`. None of that
// is faithful under createDOM/happy-dom — there is no node-layer spec, so this
// is the hook's only real coverage. See [[project_qwik_browser_testing]] and
// [[feedback_qwik_visible_task_strategy]].

const Harness = component$(() => {
  const { ref, animationController } = useAutoAnimate();
  const store = useStore<{ items: number[] }>({ items: [1, 2, 3] });
  return (
    <div>
      {/* Surfaces whether the controller attached + is enabled, without
          reaching into the noSerialize'd object from the test. */}
      <output data-testid="enabled">
        {String(animationController.value?.isEnabled() ?? false)}
      </output>
      <button
        data-testid="add"
        onClick$={() => {
          store.items = [...store.items, store.items.length + 1];
        }}
      >
        Add
      </button>
      <ul ref={ref}>
        {store.items.map((item) => (
          <li key={item} data-testid="item">
            Item {item}
          </li>
        ))}
      </ul>
    </div>
  );
});

describe("[CSR] useAutoAnimate", () => {
  test("attaches an enabled animation controller after mount", async () => {
    const screen = await render(<Harness />);

    // The visible-task must have run and `autoAnimate()` returned a live
    // controller — this is precisely what createDOM cannot produce.
    await vi.waitFor(() =>
      expect(screen.getByTestId("enabled").element().textContent).toBe("true"),
    );
  });

  test("the animated container still renders and grows its children", async () => {
    const screen = await render(<Harness />);
    await vi.waitFor(() =>
      expect(screen.getByTestId("enabled").element().textContent).toBe("true"),
    );

    expect(document.querySelectorAll('[data-testid="item"]')).toHaveLength(3);

    await screen.getByTestId("add").click();

    // Attaching auto-animate to the container must not break normal Qwik
    // re-render of the list.
    await vi.waitFor(() =>
      expect(document.querySelectorAll('[data-testid="item"]')).toHaveLength(4),
    );
  });
});
