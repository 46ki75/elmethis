import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmTextField } from "./elm-text-field";

describe("[CSR] ElmTextField — rendering", () => {
  test("renders the label", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Username" />);
    expect(screen.outerHTML).toContain("Username");
  });

  test("placeholder is forwarded onto the input", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Email" placeholder="you@example.com" />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.placeholder).toBe("you@example.com");
  });

  test("a bound value renders as the input value", async () => {
    const Harness = component$(() => {
      const value = useSignal("seed");
      return <ElmTextField label="Name" value={value} />;
    });
    const { screen, render } = await createDOM();
    await render(<Harness />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("seed");
  });

  test("disabled forwards onto the input and applies the disabled class", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Locked" disabled />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.outerHTML).toMatch(/_disabled_/);
  });

  test("required renders the marker and sets aria-required", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Mandatory" required />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(screen.outerHTML).toContain("*");
  });

  test("isPassword renders the input with type=password", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Secret" isPassword />);
    const input = screen.querySelector("input") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  test("renders a leading icon by default when no icon slot is provided", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextField label="Text" />);
    // ElmMdiIcon (mdiText) renders as an <svg>.
    expect(screen.outerHTML.toLowerCase()).toContain("<svg");
  });
});

describe("[CSR] ElmTextField — value binding", () => {
  test("typing into the input writes back to the bound signal", async () => {
    const Harness = component$(() => {
      const value = useSignal("");
      return (
        <div>
          <output data-testid="value">{value.value}</output>
          <ElmTextField label="Name" value={value} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);

    const input = screen.querySelector("input") as HTMLInputElement;
    input.value = "Ada";
    await userEvent("input", "input");

    await vi.waitFor(() =>
      expect(screen.querySelector('[data-testid="value"]')?.textContent).toBe(
        "Ada",
      ),
    );
  });

  test("renders a character counter when value is bound (with maxLength)", async () => {
    const Harness = component$(() => {
      const value = useSignal("abc");
      return <ElmTextField label="Counted" value={value} maxLength={10} />;
    });
    const { screen, render } = await createDOM();
    await render(<Harness />);
    expect(screen.outerHTML).toContain("3 / 10");
  });
});

describe("[SSR] ElmTextField", () => {
  test("renders the label and an input in the server shell", async () => {
    const renderResult = await renderToString(<ElmTextField label="SSR" />, {
      containerTagName: "div",
    });
    expect(renderResult.html).toContain("SSR");
    expect(renderResult.html.toLowerCase()).toContain("<input");
  });
});
