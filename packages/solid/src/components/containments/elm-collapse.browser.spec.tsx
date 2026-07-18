import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { ElmCollapse } from "./elm-collapse";

describe("[Browser] ElmCollapse", () => {
  it("collapses and expands row layout with the configured timing function", async () => {
    const [open, setOpen] = createSignal(false);
    const rendered = render(() => (
      <ElmCollapse
        data-testid="collapse"
        isOpen={open()}
        transitionTimingFunction="linear"
        style={{ "--elmethis-scoped-collapse-transition-duration": "0ms" }}
      >
        <div style={{ height: "48px" }}>Collapsible content</div>
      </ElmCollapse>
    ));
    const screen = page.elementLocator(rendered.baseElement);

    await expect
      .element(screen.getByText("Collapsible content"))
      .toBeInTheDocument();

    const collapse = rendered.getByTestId("collapse");
    expect(collapse.getBoundingClientRect().height).toBe(0);
    expect(getComputedStyle(collapse).transitionTimingFunction).toBe("linear");

    setOpen(true);

    expect(collapse.getBoundingClientRect().height).toBe(48);
    expect(getComputedStyle(collapse).gridTemplateRows).not.toBe("0px");
  });
});
