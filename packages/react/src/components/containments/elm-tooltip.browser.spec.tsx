import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmTooltip } from "./elm-tooltip";

// The hover handler reads real layout (`getBoundingClientRect`, `innerWidth`)
// to position the tooltip, which jsdom cannot provide faithfully — so show/hide
// is exercised here in a real browser.

describe("[CSR] hover", () => {
  test("mouseover marks the tooltip shown, mouseleave hides it after the delay", async () => {
    await render(
      <ElmTooltip
        original={<span data-testid="trigger">trigger</span>}
        tooltip={<span>tip body</span>}
      />,
    );

    const host = document.querySelector(
      "[class*='elm-tooltip']",
    )! as HTMLElement;
    await vi.waitFor(() => expect(host).toBeTruthy());

    const tooltip = host.querySelector<HTMLElement>("[class*='tooltip']")!;
    expect(tooltip.className).not.toContain("show");

    host.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await vi.waitFor(() => expect(tooltip.className).toContain("show"));

    // mouseleave schedules a 250ms hide; poll past it. React synthesizes
    // `onMouseLeave` from a native `mouseout` whose relatedTarget lies outside
    // the element — so dispatch that, not a raw `mouseleave` (which React's
    // delegated event system ignores).
    host.dispatchEvent(
      new MouseEvent("mouseout", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    await vi.waitFor(() => expect(tooltip.className).not.toContain("show"), {
      timeout: 1000,
    });
  });
});
