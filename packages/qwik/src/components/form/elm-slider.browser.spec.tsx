// Real `@elmethis/core` tokens (incl. the monospace font stack `.mark-label`
// uses) so label widths in this file's regression tests reflect the actual
// rendered font metrics instead of the browser's default serif fallback.
import "@elmethis/core/tokens.css";
import { render } from "vitest-browser-qwik";
import { describe, expect, test } from "vitest";

import { ElmSlider } from "./elm-slider";

// happy-dom/createDOM has no layout engine, so `getBoundingClientRect()`
// always reports a zero-sized box — pointer-driven dragging (ratio-from-
// position math) and real CSS layout assertions can only be exercised
// against a real Chromium layout, hence this lives here rather than in the
// unit spec.

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

  test("pointerdown snaps to the step grid when step is negative", async () => {
    // Keyboard stepping treats `step` as a granularity via `Math.abs(step)`,
    // so ArrowRight/PageUp move in multiples of 10 even when step is -10.
    // Pointer-driven clicks must snap to the same grid.
    const screen = await render(<ElmSlider min={0} max={100} step={-10} />);
    const el = sliderEl(screen);
    el.style.width = "200px";

    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: rect.left + rect.width * 0.53,
        pointerId: 1,
      }),
    );

    await expect
      .poll(() => Number(el.getAttribute("aria-valuenow")) % 10)
      .toBe(0);
  });
});

describe("[CSR] ElmSlider vertical/marker layout", () => {
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

  test("vertical: the progress fill spans the rail's full cross-axis width", async () => {
    const screen = await render(
      <ElmSlider min={0} max={100} orientation="vertical" defaultValue={70} />,
    );
    const fill = screen.container.querySelector(
      '[class*="fill"]',
    ) as HTMLElement;
    const rail = screen.container.querySelector(
      '[class*="rail"]',
    ) as HTMLElement;

    // The vertical fill's *length* (height) represents progress, the way the
    // horizontal fill's *length* (width) does — its cross-axis thickness
    // (width) must match the rail's, not shrink toward 0 as value approaches
    // innerMin.
    await expect
      .poll(() => fill.getBoundingClientRect().width)
      .toBeCloseTo(rail.getBoundingClientRect().width, 1);
  });

  test("markerLabels: the wrapper reserves layout space so labels render inside its own box", async () => {
    const screen = await render(
      <ElmSlider min={0} max={100} step={25} markers markerLabels />,
    );
    const wrapper = screen.container.querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    wrapper.style.width = "300px";
    const labels = screen.container.querySelectorAll('[class*="mark-label"]');
    expect(labels.length).toBeGreaterThan(0);

    const wrapperRect = wrapper.getBoundingClientRect();
    Array.from(labels).forEach((label) => {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.bottom).toBeLessThanOrEqual(wrapperRect.bottom);
    });
  });

  test("vertical + markerLabels: wide (5-digit) labels still render inside the wrapper's inline-end edge", async () => {
    const screen = await render(
      <ElmSlider
        orientation="vertical"
        min={0}
        max={100000}
        step={25000}
        markers
        markerLabels
      />,
    );
    const wrapper = screen.container.querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    const labels = screen.container.querySelectorAll('[class*="mark-label"]');
    expect(labels.length).toBeGreaterThan(0);

    const wrapperRect = wrapper.getBoundingClientRect();
    Array.from(labels).forEach((label) => {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.right).toBeLessThanOrEqual(wrapperRect.right);
    });
  });

  test("vertical + markerLabels under dir=rtl: wide (5-digit) labels still render inside the wrapper's own edge", async () => {
    const screen = await render(
      <div dir="rtl">
        <ElmSlider
          orientation="vertical"
          min={0}
          max={100000}
          step={25000}
          markers
          markerLabels
        />
      </div>,
    );
    const wrapper = screen.container.querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    const labels = screen.container.querySelectorAll('[class*="mark-label"]');
    expect(labels.length).toBeGreaterThan(0);

    const wrapperRect = wrapper.getBoundingClientRect();
    Array.from(labels).forEach((label) => {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.right).toBeLessThanOrEqual(wrapperRect.right);
    });
  });

  test("vertical: the max-value mark sits flush with the track's top edge", async () => {
    const screen = await render(
      <ElmSlider
        orientation="vertical"
        min={0}
        max={10}
        step={1}
        markers
        markerLabels
      />,
    );
    const track = screen.container.querySelector(
      '[class*="track"]',
    ) as HTMLElement;
    const markEnd = screen.container.querySelector(
      '[class*="mark-end"]',
    ) as HTMLElement;

    const trackRect = track.getBoundingClientRect();
    const markEndRect = markEnd.getBoundingClientRect();

    expect(Math.abs(markEndRect.top - trackRect.top)).toBeLessThan(2);
  });
});
