// Real `@elmethis/core` tokens (incl. the monospace font stack `.mark-label`
// uses) so label widths in this file's regression tests reflect the actual
// rendered font metrics instead of the browser's default serif fallback.
import "@elmethis/core/tokens.css";
import { render } from "vitest-browser-vue";
import { defineComponent, h } from "vue";
import { describe, expect, test } from "vitest";

import { ElmSlider, type ElmSliderProps } from "./elm-slider";

// happy-dom has no layout engine, so `getBoundingClientRect()` always reports
// a zero-sized box — pointer-driven dragging (ratio-from-position math) can
// only be exercised against a real Chromium layout, hence this lives here
// rather than in the unit spec.

const harness = (props: ElmSliderProps) =>
  defineComponent({ setup: () => () => h(ElmSlider, props) });

type Screen = ReturnType<typeof render>;
const root = (screen: Screen) => screen.container as HTMLElement;
const sliderEl = (screen: Screen) =>
  root(screen).querySelector('[role="slider"]') as HTMLElement;

describe("[CSR] ElmSlider pointer interaction", () => {
  test("clicking the track sets the value proportionally to the click position", async () => {
    const screen = render(harness({ min: 0, max: 100, step: 1 }));
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
    const screen = render(
      harness({ min: 0, max: 100, innerMin: 20, innerMax: 80 }),
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
    const screen = render(
      harness({ min: 0, max: 100, orientation: "vertical" }),
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

describe("[CSR] ElmSlider — layout & CSS regressions", () => {
  test("vertical: the progress fill renders with non-zero width", async () => {
    const screen = render(
      harness({ min: 0, max: 100, orientation: "vertical", defaultValue: 70 }),
    );
    const fill = root(screen).querySelector('[class*="fill"]') as HTMLElement;

    await expect
      .poll(() => fill.getBoundingClientRect().width)
      .toBeGreaterThan(0);
  });

  test("vertical: the progress fill spans the rail's full cross-axis width", async () => {
    const screen = render(
      harness({ min: 0, max: 100, orientation: "vertical", defaultValue: 70 }),
    );
    const fill = root(screen).querySelector('[class*="fill"]') as HTMLElement;
    const rail = root(screen).querySelector('[class*="rail"]') as HTMLElement;

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
    // Pointer-driven clicks must snap to the same grid.
    const screen = render(harness({ min: 0, max: 100, step: -10 }));
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
    // row must render inside the wrapper's own bottom edge.
    const screen = render(
      harness({
        min: 0,
        max: 100,
        step: 25,
        markers: true,
        markerLabels: true,
      }),
    );
    const wrapper = root(screen).querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    wrapper.style.width = "300px";
    const labels = root(screen).querySelectorAll('[class*="mark-label"]');
    expect(labels.length).toBeGreaterThan(0);

    const wrapperRect = wrapper.getBoundingClientRect();
    for (const label of labels) {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.bottom).toBeLessThanOrEqual(wrapperRect.bottom);
    }
  });

  test("vertical + markerLabels: wide (5-digit) labels still render inside the wrapper's inline-end edge", async () => {
    // `.vertical.has-marker-labels` reserves a padding sized dynamically via
    // `--elmethis-scoped-max-marker-label-chars`. A range whose marker labels
    // reach 4+ digits (e.g. 25000, 100000) must still render inside the
    // wrapper's own edge instead of spilling past it.
    const screen = render(
      harness({
        orientation: "vertical",
        min: 0,
        max: 100000,
        step: 25000,
        markers: true,
        markerLabels: true,
      }),
    );
    const wrapper = root(screen).querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    const labels = root(screen).querySelectorAll('[class*="mark-label"]');
    expect(labels.length).toBeGreaterThan(0);

    const wrapperRect = wrapper.getBoundingClientRect();
    for (const label of labels) {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.right).toBeLessThanOrEqual(wrapperRect.right);
    }
  });

  test("vertical + markerLabels under dir=rtl: wide (5-digit) labels still render inside the wrapper's own edge", async () => {
    // `.vertical.has-marker-labels` reserves its budget via a physical
    // `padding-right` on purpose: `.vertical .mark`'s positioning is all
    // physical (direction-agnostic), rendering on the physical right
    // regardless of `dir`. Under RTL the reserved space must still protect
    // the labels rather than sitting uselessly on the opposite side.
    const RtlWrapper = defineComponent({
      setup: () => () =>
        h("div", { dir: "rtl" }, [
          h(ElmSlider, {
            orientation: "vertical",
            min: 0,
            max: 100000,
            step: 25000,
            markers: true,
            markerLabels: true,
          }),
        ]),
    });

    const screen = render(RtlWrapper);
    const wrapper = root(screen).querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    const labels = root(screen).querySelectorAll('[class*="mark-label"]');
    expect(labels.length).toBeGreaterThan(0);

    const wrapperRect = wrapper.getBoundingClientRect();
    for (const label of labels) {
      const labelRect = label.getBoundingClientRect();
      expect(labelRect.right).toBeLessThanOrEqual(wrapperRect.right);
    }
  });

  test("vertical: the max-value mark sits flush with the track's top edge", async () => {
    // `.vertical .mark-start` cancels the default centering translate so its
    // untransformed box (already flush with the track's bottom, via
    // `bottom: 0%`) stays flush at the bottom. `.vertical .mark-end`'s
    // untransformed box (via `bottom: 100%`) sits one row-height above the
    // track's top edge, so it needs a `+100%` Y-translate to bring it down
    // flush with the top edge.
    const screen = render(
      harness({
        orientation: "vertical",
        min: 0,
        max: 10,
        step: 1,
        markers: true,
        markerLabels: true,
      }),
    );
    const track = root(screen).querySelector('[class*="track"]') as HTMLElement;
    const markEnd = root(screen).querySelector(
      '[class*="mark-end"]',
    ) as HTMLElement;

    const trackRect = track.getBoundingClientRect();
    const markEndRect = markEnd.getBoundingClientRect();

    expect(Math.abs(markEndRect.top - trackRect.top)).toBeLessThan(2);
  });
});
