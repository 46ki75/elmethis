import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmSwitch } from "./elm-switch";

// `checked` is a required `Signal<boolean>` binding, so every case wraps the
// switch in a harness that owns the signal and mirrors it for assertions.
const Harness = component$<{ initial?: boolean; disabled?: boolean }>(
  ({ initial = false, disabled }) => {
    const checked = useSignal(initial);
    return (
      <div>
        <output data-testid="state">{String(checked.value)}</output>
        <ElmSwitch checked={checked} disabled={disabled} />
      </div>
    );
  },
);

const state = (screen: { querySelector: (s: string) => Element | null }) =>
  screen.querySelector('[data-testid="state"]')?.textContent;

describe("[CSR] ElmSwitch — rendering", () => {
  test("renders a checkbox input reflecting the bound value (off)", async () => {
    const { screen, render } = await createDOM();
    await render(<Harness />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  test("renders checked when the bound signal starts true", async () => {
    const { screen, render } = await createDOM();
    await render(<Harness initial />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(screen.outerHTML).toMatch(/_checked_/);
  });

  test("disabled forwards onto the input and applies the disabled class", async () => {
    const { screen, render } = await createDOM();
    await render(<Harness disabled />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.outerHTML).toMatch(/_disabled_/);
  });
});

describe("[CSR] ElmSwitch — toggle behavior", () => {
  test("clicking toggles the bound signal", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);
    expect(state(screen)).toBe("false");

    await userEvent("input", "click");

    await vi.waitFor(() => expect(state(screen)).toBe("true"));
  });

  test("does not toggle when disabled", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<Harness disabled />);

    await userEvent("input", "click");

    expect(state(screen)).toBe("false");
  });
});

describe("[SSR] ElmSwitch", () => {
  test("renders a checkbox input in the server shell", async () => {
    const renderResult = await renderToString(<Harness initial />, {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });
    expect(renderResult.html.toLowerCase()).toContain('type="checkbox"');
  });
});
