import "@elmethis/core/tokens.css";
import { render } from "vitest-browser-vue";
import { defineComponent, h, ref } from "vue";
import { describe, expect, test, vi } from "vitest";

import { ElmSelect } from "./elm-select";

// ElmSelect renders its options with per-iteration `onClick` handlers, and the
// collapsed list is clipped (not `display:none`) by ElmCollapse's
// `grid-template-rows: 0fr` + `overflow: hidden`. Real layout and a genuine
// option click are exercised here in a real browser.

const Harness = defineComponent({
  name: "Harness",
  setup() {
    const selected = ref<string | null>(null);
    return () =>
      h("div", [
        h("output", { "data-testid": "selected" }, String(selected.value)),
        h(ElmSelect, {
          label: "Pick",
          selectedOptionId: selected.value,
          "onUpdate:selectedOptionId": (v: string | null) =>
            (selected.value = v),
          options: [
            { id: "a", label: "Apple" },
            { id: "b", label: "Banana" },
            { id: "c", label: "Cherry" },
          ],
        }),
      ]);
  },
});

const selectRoot = () =>
  document.querySelector('[class*="elm-select"]') as HTMLElement;
const isActive = () => /active/.test(selectRoot().className);
const selectedText = () =>
  document.querySelector('[class*="selected-option"]')?.textContent ?? "";

describe("[browser] ElmSelect option selection", () => {
  test("clicking an option resolves its handler and updates the binding", async () => {
    const screen = await render(Harness);

    await screen.getByText("Pick").click();
    await screen.getByText("Banana").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe("b"),
    );
    await vi.waitFor(() => expect(selectedText()).toContain("Banana"));
  });

  test("selecting an option closes the dropdown", async () => {
    const screen = await render(Harness);

    await screen.getByText("Pick").click();
    await vi.waitFor(() => expect(isActive()).toBe(true));

    await screen.getByText("Cherry").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe("c"),
    );
    await vi.waitFor(() => expect(isActive()).toBe(false));
  });

  test("hides the select frame without changing dropdown behavior", async () => {
    const screen = await render(ElmSelect, {
      props: {
        label: "Pick",
        options: [{ id: "a", label: "Apple" }],
        frameless: true,
        style: { transition: "none" },
      },
    });
    const select = selectRoot();
    const style = getComputedStyle(select);

    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style.boxShadow).toBe("none");
    expect(select.hasAttribute("frameless")).toBe(false);

    await screen.getByText("Select an option").click();
    await expect.poll(isActive).toBe(true);
    expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");

    await screen.getByText("Apple").click();
    await expect.poll(isActive).toBe(false);
    expect(selectedText()).toBe("Apple");
  });
});
