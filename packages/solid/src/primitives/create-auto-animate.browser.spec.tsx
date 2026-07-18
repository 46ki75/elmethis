import { render } from "@solidjs/testing-library";
import { createSignal, For, Show } from "solid-js";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { createAutoAnimate } from "./create-auto-animate";

type AutoAnimateApi = ReturnType<typeof createAutoAnimate<HTMLElement>>;

let api: AutoAnimateApi | undefined;

const Harness = () => {
  const autoAnimate = createAutoAnimate<HTMLElement>({
    config: { duration: 500, disrespectUserMotionPreference: true },
  });
  const [items, setItems] = createSignal([1, 2, 3]);
  const [alternate, setAlternate] = createSignal(false);
  api = autoAnimate;

  const parent = () => (
    <For each={items()}>{(item) => <li>Item {item}</li>}</For>
  );

  return (
    <div>
      <output data-testid="enabled">
        {String(
          autoAnimate.enabled() &&
            (autoAnimate.controller()?.isEnabled() ?? false),
        )}
      </output>
      <button onClick={() => autoAnimate.setEnabled(!autoAnimate.enabled())}>
        Toggle animation
      </button>
      <button onClick={() => setItems((current) => [...current, 4])}>
        Add item
      </button>
      <button onClick={() => setAlternate((current) => !current)}>
        Replace parent
      </button>
      <Show
        when={alternate()}
        fallback={
          <ul ref={autoAnimate.ref} data-testid="parent">
            {parent()}
          </ul>
        }
      >
        <ol ref={autoAnimate.ref} data-testid="parent">
          {parent()}
        </ol>
      </Show>
    </div>
  );
};

describe("[Browser] createAutoAnimate", () => {
  it("attaches a real controller and preserves Solid list updates", async () => {
    const rendered = render(() => <Harness />);
    const screen = page.elementLocator(rendered.baseElement);

    await expect
      .element(screen.getByTestId("enabled"))
      .toHaveTextContent("true");
    const parent = rendered.getByTestId("parent");
    expect(parent.style.position).toBe("relative");
    expect(api?.controller()?.parent).toBe(parent);
    expect(parent.children).toHaveLength(3);

    await screen.getByRole("button", { name: "Add item" }).click();
    await vi.waitFor(() => expect(parent.children).toHaveLength(4));

    await screen.getByRole("button", { name: "Toggle animation" }).click();
    await expect
      .element(screen.getByTestId("enabled"))
      .toHaveTextContent("false");
    expect(api?.controller()?.isEnabled()).toBe(false);
  });

  it("destroys replaced controllers and the active controller on cleanup", async () => {
    const rendered = render(() => <Harness />);
    const screen = page.elementLocator(rendered.baseElement);

    await expect
      .element(screen.getByTestId("enabled"))
      .toHaveTextContent("true");
    const firstController = api?.controller();
    expect(firstController).toBeDefined();

    await screen.getByRole("button", { name: "Replace parent" }).click();
    await vi.waitFor(() => expect(api?.controller()).not.toBe(firstController));

    const secondController = api?.controller();
    expect(firstController?.isEnabled()).toBe(false);
    expect(secondController?.parent).toBe(rendered.getByTestId("parent"));
    expect(secondController?.isEnabled()).toBe(true);

    rendered.unmount();
    expect(secondController?.isEnabled()).toBe(false);
    expect(api?.controller()).toBeUndefined();
  });
});
