import { render } from "vitest-browser-vue";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

import { ElmTooltip } from "./elm-tooltip";

// The hover handler reads real layout (`getBoundingClientRect`, `innerWidth`)
// to position the tooltip, which happy-dom cannot provide faithfully — so
// show/hide is exercised here in a real browser.

const Harness = defineComponent({
  name: "Harness",
  setup() {
    return () =>
      h(ElmTooltip, null, {
        original: () => h("span", { "data-testid": "trigger" }, "trigger"),
        tooltip: () => h("span", "tip body"),
      });
  },
});

describe("[browser] hover", () => {
  test("mouseover marks the tooltip shown, mouseleave hides it after the delay", async () => {
    render(Harness);

    const host = document.querySelector(
      "[class*='elm-tooltip']",
    )! as HTMLElement;
    await vi.waitFor(() => expect(host).toBeTruthy());

    const tooltip = host.querySelector<HTMLElement>("[class*='tooltip']")!;
    expect(tooltip.className).not.toContain("show");

    // Vue attaches native listeners directly (no synthetic delegation), so a
    // real `mouseover` / `mouseleave` dispatched on the host reaches them.
    host.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await vi.waitFor(() => expect(tooltip.className).toContain("show"));

    // mouseleave schedules a 250ms hide; poll past it.
    host.dispatchEvent(new MouseEvent("mouseleave"));
    await vi.waitFor(() => expect(tooltip.className).not.toContain("show"), {
      timeout: 1000,
    });
  });
});
