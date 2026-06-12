import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { $, component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmButton } from "./elm-button";

describe("[CSR] ElmButton — rendering & variants", () => {
  test("renders slot content inside a <button>", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmButton>Click me</ElmButton>);
    expect(screen.outerHTML.toLowerCase()).toContain("<button");
    expect(screen.outerHTML).toContain("Click me");
  });

  test("primary applies the primary variant class", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmButton primary>Primary</ElmButton>);
    expect(screen.outerHTML).toMatch(/_primary_/);
  });

  test("default (no primary, no color) applies the normal variant class", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmButton>Normal</ElmButton>);
    expect(screen.outerHTML).toMatch(/_normal_/);
  });

  test("isLoading renders the loading icon instead of slot content", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmButton isLoading>Hidden</ElmButton>);
    // ElmDotLoadingIcon renders in place of the slot; the slot content is gone.
    expect(screen.outerHTML).toMatch(/_elm-dot-loading-icon_/);
    expect(screen.outerHTML).not.toContain("Hidden");
  });

  test("disabled forwards the native attribute onto the <button>", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmButton disabled>Nope</ElmButton>);
    const button = screen.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

describe("[CSR] ElmButton — onClick$", () => {
  test("fires onClick$ when enabled", async () => {
    const Harness = component$(() => {
      const count = useSignal(0);
      return (
        <div>
          <output data-testid="count">{count.value}</output>
          <ElmButton onClick$={$(() => count.value++)}>Go</ElmButton>
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);
    await userEvent("button", "click");

    await vi.waitFor(() =>
      expect(screen.querySelector('[data-testid="count"]')?.textContent).toBe(
        "1",
      ),
    );
  });

  test("does not fire onClick$ when disabled", async () => {
    const Harness = component$(() => {
      const count = useSignal(0);
      return (
        <div>
          <output data-testid="count">{count.value}</output>
          <ElmButton disabled onClick$={$(() => count.value++)}>
            Go
          </ElmButton>
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);
    await userEvent("button", "click");

    expect(screen.querySelector('[data-testid="count"]')?.textContent).toBe(
      "0",
    );
  });

  test("does not fire onClick$ when isLoading", async () => {
    const Harness = component$(() => {
      const count = useSignal(0);
      return (
        <div>
          <output data-testid="count">{count.value}</output>
          <ElmButton isLoading onClick$={$(() => count.value++)}>
            Go
          </ElmButton>
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);
    await userEvent("button", "click");

    expect(screen.querySelector('[data-testid="count"]')?.textContent).toBe(
      "0",
    );
  });
});

describe("[SSR] ElmButton", () => {
  test("renders slot content in the server shell", async () => {
    const renderResult = await renderToString(
      <ElmButton primary>Submit</ElmButton>,
      { containerTagName: "div" },
    );
    expect(renderResult.html.toLowerCase()).toContain("<button");
    expect(renderResult.html).toContain("Submit");
  });
});
