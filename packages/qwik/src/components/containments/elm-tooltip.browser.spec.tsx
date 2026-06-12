import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { describe, expect, test, vi } from "vitest";

import { ElmTooltip } from "./elm-tooltip";

// The hover handler reads real layout (`getBoundingClientRect`, `innerWidth`)
// to position the tooltip, which createDOM cannot provide — so show/hide is
// exercised here in a real browser.

describe("[CSR] hover", () => {
  // Inline literals only — no module-level const closure (Qwik re-imports the
  // segment, which would re-run describe()).
  const Tip = component$(() => (
    <ElmTooltip>
      <span q:slot="original" data-testid="trigger">
        trigger
      </span>
      <span q:slot="tooltip">tip body</span>
    </ElmTooltip>
  ));

  test("mouseover marks the tooltip shown, mouseleave hides it after the delay", async () => {
    const screen = await render(<Tip />);

    const host = document.querySelector(
      "[class*='elm-tooltip']",
    )! as HTMLElement;
    await vi.waitFor(() => expect(host).toBeTruthy());

    const tooltip = host.querySelector<HTMLElement>("[class*='tooltip']")!;
    expect(tooltip.className).not.toContain("show");

    host.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await vi.waitFor(() => expect(tooltip.className).toContain("show"));

    // mouseleave schedules a 250ms hide; poll past it.
    host.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await vi.waitFor(() => expect(tooltip.className).not.toContain("show"), {
      timeout: 1000,
    });
  });
});
