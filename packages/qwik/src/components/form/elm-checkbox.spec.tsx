import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmCheckbox } from "./elm-checkbox";

// CSS Modules mangle authored class names to `_<name>_<hash>`, so target the
// scoped root by its authored-name substring.
const ROOT = '[class*="elm-checkbox"]';

// The checkbox renders a `<polyline class="check-line">` only while checked, so
// the presence of that class is the rendered signal of the checked state.
const isChecked = (html: string) => /_check-line_/.test(html);

describe("[CSR] ElmCheckbox — rendering", () => {
  test("renders the label", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmCheckbox label="Accept terms" />);
    expect(screen.outerHTML).toContain("Accept terms");
  });

  test("unchecked by default (no check-line)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmCheckbox label="Off" />);
    expect(isChecked(screen.outerHTML)).toBe(false);
  });

  test("defaultChecked renders in the checked state when uncontrolled", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmCheckbox label="On" defaultChecked />);
    expect(isChecked(screen.outerHTML)).toBe(true);
  });

  test("disabled applies the disabled class", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmCheckbox label="Disabled" disabled />);
    expect(screen.outerHTML).toMatch(/_disabled_/);
  });
});

describe("[CSR] ElmCheckbox — toggle behavior", () => {
  test("clicking toggles the uncontrolled checked state", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmCheckbox label="Toggle me" />);

    expect(isChecked(screen.outerHTML)).toBe(false);

    await userEvent(ROOT, "click");

    await vi.waitFor(() => expect(isChecked(screen.outerHTML)).toBe(true));
  });

  test("clicking writes through to a bound parent signal", async () => {
    const Harness = component$(() => {
      const checked = useSignal(false);
      return (
        <div>
          <output data-testid="state">{String(checked.value)}</output>
          <ElmCheckbox label="Bound" checked={checked} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);
    expect(screen.querySelector('[data-testid="state"]')?.textContent).toBe(
      "false",
    );

    await userEvent(ROOT, "click");

    await vi.waitFor(() =>
      expect(screen.querySelector('[data-testid="state"]')?.textContent).toBe(
        "true",
      ),
    );
  });

  test("does not toggle when disabled", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmCheckbox label="Disabled" disabled />);

    await userEvent(ROOT, "click");

    expect(isChecked(screen.outerHTML)).toBe(false);
  });

  test("does not toggle when isLoading", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmCheckbox label="Loading" isLoading />);

    await userEvent(ROOT, "click");

    expect(isChecked(screen.outerHTML)).toBe(false);
  });
});

describe("[SSR] ElmCheckbox", () => {
  test("renders the label in the server shell", async () => {
    const renderResult = await renderToString(<ElmCheckbox label="SSR" />, {
      containerTagName: "div",
    });
    expect(renderResult.html).toContain("SSR");
  });
});
