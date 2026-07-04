// Real `@elmethis/core` tokens (incl. the monospace font stack `.mark-label`
// uses) so label widths in this file's regression tests reflect the actual
// rendered font metrics instead of the browser's default serif fallback.
import "@elmethis/core/tokens.css";
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

  test("pointerdown snaps to the step grid when step is negative", async () => {
    // Keyboard stepping treats `step` as a granularity via `Math.abs(step)`,
    // so ArrowRight/PageUp move in multiples of 10 even when step is -10.
    // Pointer-driven clicks must snap to the same grid; `snap()`'s
    // `step > 0` guard currently treats a negative step as "no snapping" and
    // returns the raw, unsnapped ratio-derived value instead.
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

  test("markerLabels: the wrapper reserves layout space so labels render inside its own box", async () => {
    // `.track` has a fixed height with no space reserved for `.marks`, and
    // `.marks`/`.mark`/`.mark-label` are all `position: absolute`, so they
    // never contribute to `.track`'s or `.elm-slider`'s box size. The label
    // row currently renders entirely below the wrapper's own bottom edge.
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
    for (const label of labels) {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.bottom).toBeLessThanOrEqual(wrapperRect.bottom);
    }
  });

  test("vertical + markerLabels: wide (5-digit) labels still render inside the wrapper's inline-end edge", async () => {
    // `.vertical.has-marker-labels` reserves a *fixed* `padding-inline-end`
    // (2.5rem) sized for short labels. That budget doesn't scale with digit
    // count, so a range whose marker labels reach 4+ digits (e.g. 25000,
    // 100000) renders labels that spill past the wrapper's own right edge
    // instead of staying inside the reserved space — unlike the horizontal
    // orientation, where the reserved `padding-block-end` only needs to hold
    // a label's line-height, which stays constant regardless of digit count.
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
    for (const label of labels) {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.right).toBeLessThanOrEqual(wrapperRect.right);
    }
  });

  test("vertical + markerLabels under dir=rtl: wide (5-digit) labels still render inside the wrapper's own edge", async () => {
    // `.vertical.has-marker-labels` reserves its budget via the *logical*
    // `padding-inline-end`, which the browser maps to physical `padding-left`
    // under `dir="rtl"`. But `.vertical .mark`'s `left: 50%` +
    // `transform: translate(0.75rem, 50%)` (and the tick/label layout that
    // follows) are all physical, direction-agnostic positioning that keeps
    // rendering on the physical right regardless of `dir`. So under RTL the
    // reserved space sits uselessly on the left while the labels it was
    // meant to protect still overflow on the physical right, past the
    // wrapper's own right edge.
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
    for (const label of labels) {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.right).toBeLessThanOrEqual(wrapperRect.right);
    }
  });

  test("vertical: the max-value mark sits flush with the track's top edge", async () => {
    // `.vertical .mark-start` cancels the default centering translate with
    // `translate(0.75rem, 0)` so its untransformed box (already flush with
    // the track's bottom, via `bottom: 0%`) stays flush at the bottom.
    // `.vertical .mark-end`'s untransformed box (via `bottom: 100%`) sits one
    // row-height above the track's top edge, so the analogous fix is a
    // `+100%` Y-translate to bring it down flush with the top edge — not
    // `-100%`, which shifts it a further row-height away (up).
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
