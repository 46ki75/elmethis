import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
} from "./elm-button-dropdown";

// Item-click selection (clipped collapse list, per-item handlers, real layout
// and outside-click) lives in elm-button-dropdown.browser.spec.tsx. The unit
// layer covers the SSR shell: the two button segments, the placeholder, the
// selected option's label, and the disable variants.

const ITEMS: ElmButtonDropdownItem[] = [
  { id: "edit", label: "Edit" },
  { id: "remove", label: "Remove", disabled: true },
];

const render = (props: Record<string, unknown>) =>
  renderToString(
    createSSRApp({
      render: () =>
        h(ElmButtonDropdown, { label: "Choose", items: ITEMS, ...props }),
    }),
  );

describe("[SSR] ElmButtonDropdown", () => {
  it("renders two buttons: the main action and the caret toggle", async () => {
    const html = await render({});
    expect(html.split("<button").length - 1).toBe(2);
  });

  it("shows the placeholder when nothing is selected", async () => {
    const html = await render({ label: "Choose an action" });
    expect(html).toContain("Choose an action");
  });

  it("displays the selected option's label on the main button", async () => {
    const html = await render({
      label: "Choose an action",
      selectedOptionId: "edit",
    });
    expect(html).toContain("Edit");
    // The placeholder is replaced by the selection (SSR HTML has no serialized
    // prop state to leak the placeholder string, unlike resumable frameworks).
    expect(html).not.toContain("Choose an action");
  });

  it("disabled forwards the native attribute onto both buttons", async () => {
    const html = await render({ disabled: true });
    const disabledButtons = html.match(/<button[^>]*\bdisabled\b/g) ?? [];
    expect(disabledButtons.length).toBe(2);
  });

  it("disables only the caret when disableDropdown is set", async () => {
    const html = await render({ disableDropdown: true });
    const disabledButtons = html.match(/<button[^>]*\bdisabled\b/g) ?? [];
    expect(disabledButtons.length).toBe(1);
  });
});
