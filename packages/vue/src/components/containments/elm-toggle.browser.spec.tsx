import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h, ref } from "vue";
import { describe, expect, test, vi } from "vitest";

import { ElmToggle } from "./elm-toggle";

// Click-driven toggling is verified in a real browser to mirror the qwik twin's
// split. Uncontrolled flips internal state; controlled writes straight back to
// the parent-owned value.

describe("[browser] uncontrolled toggle", () => {
  test("clicking the summary flips the open modifier", async () => {
    render(
      defineComponent({
        setup() {
          return () =>
            h(
              ElmToggle,
              { summary: "Summary" },
              {
                default: () => h("span", "Body content"),
              },
            );
        },
      }),
    );

    const root = document.querySelector("[class*='elm-toggle']")!;
    expect(root).toBeTruthy();
    expect(root.className).not.toContain("open");

    const summary = document.querySelector<HTMLElement>("[class*='summary']")!;
    summary.click();

    await vi.waitFor(() => expect(root.className).toContain("open"));
  });
});

describe("[browser] controlled toggle", () => {
  const Controlled = defineComponent({
    name: "Controlled",
    setup() {
      const isOpen = ref(false);
      return () =>
        h("div", [
          h("output", { "data-testid": "state" }, String(isOpen.value)),
          h(
            ElmToggle,
            {
              summary: "Summary",
              isOpen: isOpen.value,
              "onUpdate:isOpen": (v: boolean) => (isOpen.value = v),
            },
            { default: () => h("span", "Body content") },
          ),
        ]);
    },
  });

  test("clicking writes back to the parent-owned value", async () => {
    render(Controlled);

    await expect.element(page.getByTestId("state")).toHaveTextContent("false");

    const summary = document.querySelector<HTMLElement>("[class*='summary']")!;
    summary.click();

    await expect.element(page.getByTestId("state")).toHaveTextContent("true");

    summary.click();
    await expect.element(page.getByTestId("state")).toHaveTextContent("false");
  });
});
