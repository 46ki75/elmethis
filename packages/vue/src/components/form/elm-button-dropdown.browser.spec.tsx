import { render } from "vitest-browser-vue";
import { defineComponent, h, ref } from "vue";
import { describe, expect, test, vi } from "vitest";

import { ElmButtonDropdown } from "./elm-button-dropdown";

// ElmButtonDropdown renders its menu items with per-iteration `onClick`
// handlers, and the collapsed list is clipped (not `display:none`) by
// ElmCollapse's `grid-template-rows: 0fr` + `overflow: hidden`. Real layout and
// a genuine caret-open + item click are exercised here in a real browser.

const Harness = defineComponent({
  name: "Harness",
  setup() {
    const selected = ref<string | null>(null);
    return () =>
      h("div", [
        h("output", { "data-testid": "selected" }, String(selected.value)),
        h(ElmButtonDropdown, {
          label: "Run",
          selectedOptionId: selected.value,
          "onUpdate:selectedOptionId": (v: string | null) =>
            (selected.value = v),
          items: [
            { id: "edit", label: "Edit" },
            { id: "remove", label: "Remove" },
          ],
        }),
      ]);
  },
});

// The main button reflects the selection; scope to it so the same label still
// present in the collapsed menu row doesn't match.
const mainButtonText = () =>
  document.querySelector('[class*="main"]')?.textContent ?? "";

describe("[browser] ElmButtonDropdown selection", () => {
  test("the caret opens the menu and an item click updates the binding + display", async () => {
    const screen = render(Harness);

    await screen.getByRole("button", { name: "Toggle dropdown" }).click();
    await screen.getByText("Remove").click();

    await vi.waitFor(() =>
      expect(screen.getByTestId("selected").element().textContent).toBe(
        "remove",
      ),
    );
    await vi.waitFor(() => expect(mainButtonText()).toContain("Remove"));
  });
});
