import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmTextArea } from "./elm-text-area";

describe("[CSR] ElmTextArea — rendering", () => {
  test("renders the label", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextArea label="Bio" />);
    expect(screen.outerHTML).toContain("Bio");
  });

  test("placeholder is forwarded onto the textarea", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextArea label="Notes" placeholder="Type here" />);
    const ta = screen.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.placeholder).toBe("Type here");
  });

  test("rows defaults to 3 and honors the prop", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextArea label="Sized" rows={6} />);
    const ta = screen.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.getAttribute("rows")).toBe("6");
  });

  test("a bound value renders as the textarea value", async () => {
    const Harness = component$(() => {
      const value = useSignal("seed text");
      return <ElmTextArea label="Body" value={value} />;
    });
    const { screen, render } = await createDOM();
    await render(<Harness />);
    const ta = screen.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.value).toBe("seed text");
  });

  test("disabled forwards onto the textarea and applies the disabled class", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextArea label="Locked" disabled />);
    const ta = screen.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.disabled).toBe(true);
    expect(screen.outerHTML).toMatch(/_disabled_/);
  });

  test("required sets aria-required and renders the marker", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmTextArea label="Mandatory" required />);
    const ta = screen.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.getAttribute("aria-required")).toBe("true");
    expect(screen.outerHTML).toContain("*");
  });
});

describe("[CSR] ElmTextArea — value binding", () => {
  test("input event writes back to the bound signal", async () => {
    // A programmatic `ta.value = ...` alone does NOT fire `onInput$`; the
    // write-back only happens when an `input` event is dispatched. We set the
    // value then trigger the event through Qwik's `userEvent`.
    const Harness = component$(() => {
      const value = useSignal("");
      return (
        <div>
          <output data-testid="value">{value.value}</output>
          <ElmTextArea label="Body" value={value} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);

    const ta = screen.querySelector("textarea") as HTMLTextAreaElement;
    ta.value = "hello";
    await userEvent("textarea", "input");

    await vi.waitFor(() =>
      expect(screen.querySelector('[data-testid="value"]')?.textContent).toBe(
        "hello",
      ),
    );
  });

  test("renders a character counter when value is bound (with maxLength)", async () => {
    const Harness = component$(() => {
      const value = useSignal("abcd");
      return <ElmTextArea label="Counted" value={value} maxLength={20} />;
    });
    const { screen, render } = await createDOM();
    await render(<Harness />);
    expect(screen.outerHTML).toContain("4 / 20");
  });
});

describe("[SSR] ElmTextArea", () => {
  test("renders the label and a textarea in the server shell", async () => {
    const renderResult = await renderToString(<ElmTextArea label="SSR" />, {
      containerTagName: "div",
    });
    expect(renderResult.html).toContain("SSR");
    expect(renderResult.html.toLowerCase()).toContain("<textarea");
  });
});
