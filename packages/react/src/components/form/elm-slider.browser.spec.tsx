import { render } from "vitest-browser-react";
import { describe, expect, test } from "vitest";

import { ElmSlider } from "./elm-slider";

// happy-dom has no layout engine, so `getBoundingClientRect()` always reports
// a zero-sized box — pointer-driven dragging (ratio-from-position math) can
// only be exercised against a real Chromium layout, hence this lives here
// rather than in the unit spec.

type Screen = Awaited<ReturnType<typeof render>>;
const sliderEl = (screen: Screen) =>
  screen.container.querySelector('[role="slider"]') as HTMLElement;

describe("[CSR] ElmSlider pointer interaction", () => {
  test("clicking the track sets the value proportionally to the click position", async () => {
    const screen = await render(<ElmSlider min={0} max={100} step={1} />);
    const el = sliderEl(screen);
    el.style.width = "200px";

    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: rect.left + rect.width * 0.75,
        pointerId: 1,
      }),
    );

    await expect
      .poll(() => Number(el.getAttribute("aria-valuenow")))
      .toBeGreaterThanOrEqual(70);
  });

  test("dragging past innerMax clamps the value at the inner bound", async () => {
    const screen = await render(
      <ElmSlider min={0} max={100} innerMin={20} innerMax={80} />,
    );
    const el = sliderEl(screen);
    el.style.width = "200px";

    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: rect.right,
        pointerId: 1,
      }),
    );

    await expect.poll(() => Number(el.getAttribute("aria-valuenow"))).toBe(80);
  });

  test("vertical orientation increases the value toward the top of the track", async () => {
    const screen = await render(
      <ElmSlider min={0} max={100} orientation="vertical" />,
    );
    const el = sliderEl(screen);
    el.style.height = "200px";

    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientY: rect.top + rect.height * 0.1,
        pointerId: 1,
      }),
    );

    await expect
      .poll(() => Number(el.getAttribute("aria-valuenow")))
      .toBeGreaterThanOrEqual(80);
  });
});

// Regression test for a bug found in code review — asserts correct behavior
// and currently FAILS: `.vertical .fill` re-unsets `left` after `inset`
// anchors it, so the fill collapses to zero width and never renders.
describe("[CSR] ElmSlider — known bugs (regression)", () => {
  test("vertical: the progress fill renders with non-zero width", async () => {
    const screen = await render(
      <ElmSlider min={0} max={100} orientation="vertical" defaultValue={70} />,
    );
    const fill = screen.container.querySelector(
      '[class*="fill"]',
    ) as HTMLElement;

    await expect
      .poll(() => fill.getBoundingClientRect().width)
      .toBeGreaterThan(0);
  });
});
