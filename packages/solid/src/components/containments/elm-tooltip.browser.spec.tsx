import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { ElmTooltip } from "./elm-tooltip";

describe("[Browser] ElmTooltip", () => {
  it("positions from left-side geometry and hides after its delay", async () => {
    const rendered = render(() => (
      <ElmTooltip
        data-testid="host"
        style={{ position: "fixed", left: "24px", top: "20px" }}
        original="Trigger"
        tooltip="Tip body"
      />
    ));
    const host = rendered.getByTestId("host");
    const tooltip = host.querySelector("div")!;
    const rect = host.getBoundingClientRect();

    host.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await vi.waitFor(() => expect(tooltip.className).toMatch(/show/));
    expect(tooltip.style.left).toBe(`${rect.x}px`);
    expect(tooltip.style.top).toBe(`${rect.bottom}px`);
    expect(tooltip.style.right).toBe("");

    host.dispatchEvent(new MouseEvent("mouseleave"));
    await vi.waitFor(() => expect(tooltip.className).not.toMatch(/show/), {
      timeout: 1000,
    });
  });

  it("uses right-side geometry and cancels hiding when re-entered", async () => {
    const rendered = render(() => (
      <ElmTooltip
        data-testid="host"
        style={{ position: "fixed", right: "32px", top: "20px" }}
        original="Trigger"
        tooltip="Tip body"
      />
    ));
    const host = rendered.getByTestId("host");
    const tooltip = host.querySelector("div")!;

    host.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await vi.waitFor(() => expect(tooltip.className).toMatch(/show/));
    const rect = host.getBoundingClientRect();
    expect(tooltip.style.right).toBe(`${window.innerWidth - rect.right}px`);
    expect(tooltip.style.left).toBe("");

    host.dispatchEvent(new MouseEvent("mouseleave"));
    host.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(tooltip.className).toMatch(/show/);
  });
});
