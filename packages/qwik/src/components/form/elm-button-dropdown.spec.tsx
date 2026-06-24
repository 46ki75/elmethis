import { describe, expect, test } from "vitest";
import { component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
} from "./elm-button-dropdown";

// Option-click selection (clipped collapse list, per-item QRL handlers, real
// `useVisibleTask$`) lives in elm-button-dropdown.browser.spec.tsx — createDOM
// can't run the visible task. The unit layer covers the SSR shell: the two
// button segments, the placeholder, and the selected option's label.

const ITEMS: ElmButtonDropdownItem[] = [
  { id: "edit", label: "Edit" },
  { id: "remove", label: "Remove", disabled: true },
];

const countButtons = (html: string) => html.split("<button").length - 1;

describe("[SSR] ElmButtonDropdown", () => {
  test("renders two buttons: the main action and the caret toggle", async () => {
    const Harness = component$(() => {
      const selected = useSignal<string | null>(null);
      return (
        <ElmButtonDropdown
          label="Choose"
          items={ITEMS}
          selectedOptionId={selected}
        />
      );
    });

    const { html } = await renderToString(<Harness />, {
      containerTagName: "div",
    });
    expect(countButtons(html)).toBe(2);
  });

  test("shows the placeholder when nothing is selected", async () => {
    const Harness = component$(() => {
      const selected = useSignal<string | null>(null);
      return (
        <ElmButtonDropdown
          label="Choose an action"
          items={ITEMS}
          selectedOptionId={selected}
        />
      );
    });

    const { html } = await renderToString(<Harness />, {
      containerTagName: "div",
    });
    expect(html).toContain("Choose an action");
  });

  test("displays the selected option's label on the main button", async () => {
    const Harness = component$(() => {
      const selected = useSignal<string | null>("edit");
      return (
        <ElmButtonDropdown
          label="Choose an action"
          items={ITEMS}
          selectedOptionId={selected}
        />
      );
    });

    const { html } = await renderToString(<Harness />, {
      containerTagName: "div",
    });
    // Scope to the main button's visible text — qwik serializes the unused
    // `label` prop into its resumability state, so a global search would still
    // find the placeholder string there. The first `_flex` span after `_main_`
    // is the main button's content.
    const fromMain = html.slice(html.indexOf("_main_"));
    const mainText =
      fromMain.match(/_flex[^"]*">([\s\S]*?)<\/span>/)?.[1] ?? "";
    expect(mainText).toContain("Edit");
    expect(mainText).not.toContain("Choose an action");
  });

  test("disabled forwards the native attribute onto both buttons", async () => {
    const Harness = component$(() => {
      const selected = useSignal<string | null>(null);
      return (
        <ElmButtonDropdown
          label="Choose"
          items={ITEMS}
          selectedOptionId={selected}
          disabled
        />
      );
    });

    const { html } = await renderToString(<Harness />, {
      containerTagName: "div",
    });
    const disabledButtons = html.match(/<button[^>]*\bdisabled\b/g) ?? [];
    expect(disabledButtons.length).toBe(2);
  });
});
