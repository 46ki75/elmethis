import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";

import { ElmSlider } from "./elm-slider";

const slider = (container: HTMLElement) =>
  container.querySelector('[role="slider"]') as HTMLElement;

describe("[CSR] ElmSlider — rendering", () => {
  it("defaults to horizontal, min 0, max 100, midpoint value", () => {
    const { container } = render(<ElmSlider />);
    const el = slider(container);
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("renders vertical orientation", () => {
    const { container } = render(<ElmSlider orientation="vertical" />);
    expect(slider(container).getAttribute("aria-orientation")).toBe("vertical");
  });

  it("defaultValue seeds the uncontrolled value", () => {
    const { container } = render(<ElmSlider defaultValue={30} />);
    expect(slider(container).getAttribute("aria-valuenow")).toBe("30");
  });

  it("clamps aria-valuemin/max to the inner range", () => {
    const { container } = render(
      <ElmSlider innerMin={20} innerMax={80} defaultValue={50} />,
    );
    const el = slider(container);
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
  });

  it("clamps an out-of-inner-range defaultValue on mount", () => {
    const { container } = render(
      <ElmSlider innerMin={20} innerMax={80} defaultValue={5} />,
    );
    expect(slider(container).getAttribute("aria-valuenow")).toBe("20");
  });

  it("aria-disabled and tabIndex reflect the disabled prop", () => {
    const { container } = render(<ElmSlider disabled />);
    const el = slider(container);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el).toHaveAttribute("tabIndex", "-1");
  });

  it("renders one tick per step when markers is set", () => {
    const { container } = render(
      <ElmSlider min={0} max={100} step={25} markers />,
    );
    // 0, 25, 50, 75, 100
    expect(container.querySelectorAll("i")).toHaveLength(5);
  });

  it("renders marker labels with the formatted value", () => {
    const { container } = render(
      <ElmSlider
        min={0}
        max={100}
        step={50}
        markers
        markerLabels
        formatMarkerLabel={(v) => `${v}%`}
      />,
    );
    expect(container.textContent).toContain("0%");
    expect(container.textContent).toContain("50%");
    expect(container.textContent).toContain("100%");
  });
});

describe("[CSR] ElmSlider — keyboard interaction", () => {
  it("ArrowRight/ArrowUp increases the value by step", () => {
    const { container } = render(<ElmSlider defaultValue={50} step={5} />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(el.getAttribute("aria-valuenow")).toBe("55");

    fireEvent.keyDown(el, { key: "ArrowUp" });
    expect(el.getAttribute("aria-valuenow")).toBe("60");
  });

  it("ArrowLeft/ArrowDown decreases the value by step", () => {
    const { container } = render(<ElmSlider defaultValue={50} step={5} />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowLeft" });
    expect(el.getAttribute("aria-valuenow")).toBe("45");

    fireEvent.keyDown(el, { key: "ArrowDown" });
    expect(el.getAttribute("aria-valuenow")).toBe("40");
  });

  it("Home/End jump to the inner bounds", () => {
    const { container } = render(
      <ElmSlider innerMin={20} innerMax={80} defaultValue={50} />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "End" });
    expect(el.getAttribute("aria-valuenow")).toBe("80");

    fireEvent.keyDown(el, { key: "Home" });
    expect(el.getAttribute("aria-valuenow")).toBe("20");
  });

  it("does not move past the inner bounds", () => {
    const { container } = render(
      <ElmSlider innerMin={0} innerMax={100} defaultValue={98} step={5} />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(el.getAttribute("aria-valuenow")).toBe("100");
  });

  it("does not respond to keyboard input when disabled", () => {
    const { container } = render(<ElmSlider defaultValue={50} disabled />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("writes through to a bound parent value", () => {
    const Harness = () => {
      const [value, setValue] = useState(50);
      return (
        <div>
          <output data-testid="state">{value}</output>
          <ElmSlider value={value} onValueChange={setValue} step={10} />
        </div>
      );
    };

    const { container, getByTestId } = render(<Harness />);
    fireEvent.keyDown(slider(container), { key: "ArrowRight" });

    expect(getByTestId("state")).toHaveTextContent("60");
    expect(slider(container).getAttribute("aria-valuenow")).toBe("60");
  });
});

// Regression tests for bugs found in code review — each asserts the correct
// behavior and currently FAILS against the present implementation.
describe("[CSR] ElmSlider — known bugs (regression)", () => {
  it("clamps a controlled value that falls outside the inner range", () => {
    const { container } = render(
      <ElmSlider
        innerMin={20}
        innerMax={80}
        value={5}
        onValueChange={() => {}}
      />,
    );
    const el = slider(container);
    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(20);
  });

  it("formats marker labels without floating-point dust for a fractional step", () => {
    const { container } = render(
      <ElmSlider min={0} max={1} step={0.1} markers markerLabels />,
    );
    // 0 + 3*0.1 drifts to 0.30000000000000004 in JS float math.
    expect(container.textContent).not.toMatch(/0\.30000/);
  });

  it("does not skip a tick due to floating-point step-count error", () => {
    const { container } = render(
      <ElmSlider min={0} max={0.3} step={0.1} markers markerLabels />,
    );
    const labels = Array.from(
      container.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // Expect all 4 ticks: 0, 0.1, 0.2, 0.3. (0.3-0)/0.1 evaluates to
    // 2.9999999999999996 in JS float math, so Math.floor undercounts to 2
    // and the "0.2" tick is dropped, jumping straight from 0.1 to the
    // forced max=0.3.
    expect(labels).toHaveLength(4);
  });

  it("spans the full range instead of clustering near min when the tick count exceeds MAX_MARKERS", () => {
    const { container } = render(
      <ElmSlider min={0} max={100} step={0.01} markers />,
    );
    const marks = container.querySelectorAll('[class*="mark"]');
    const last = marks[marks.length - 1] as HTMLElement;
    const lastRatio = Number(
      last.style.getPropertyValue("--elmethis-scoped-marker-ratio"),
    );
    // The capped 501 rendered ticks should still stretch across [min, max];
    // currently the last one sits at ratio 0.05 (value 5) instead of 1 (100).
    expect(lastRatio).toBeCloseTo(1, 5);
  });

  it("sizes the vertical label reservation to a JSX-returning formatMarkerLabel's rendered text, not String(value)", () => {
    const { container } = render(
      <ElmSlider
        orientation="vertical"
        min={0}
        max={100}
        step={25}
        markers
        markerLabels
        formatMarkerLabel={(v) => <strong>{v} units of measurement</strong>}
      />,
    );
    const wrapper = container.querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    const chars = Number(
      wrapper.style.getPropertyValue(
        "--elmethis-scoped-max-marker-label-chars",
      ),
    );
    // "100 units of measurement" is 25 chars; falling back to String(100)
    // (3 chars) would under-reserve the padding and let the label overflow.
    expect(chars).toBe("100 units of measurement".length);
  });

  it("ArrowRight increases the value even when step is negative", () => {
    const { container } = render(<ElmSlider defaultValue={50} step={-10} />);
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });

    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThan(50);
  });

  it("forwards aria-label to the slider element, not an outer wrapper", () => {
    const { container } = render(<ElmSlider aria-label="Volume" />);
    expect(slider(container)).toHaveAttribute("aria-label", "Volume");
  });

  it("renders tick/label values on the actual step grid, not an evenly-resampled one", () => {
    const { container } = render(
      <ElmSlider min={0} max={10} step={3} markers markerLabels />,
    );
    const labels = Array.from(
      container.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // step=3 over [0, 10] only ever snaps to 0, 3, 6, 9 (plus the forced
    // max=10); it must never render 3.3333.../6.6666... ticks the thumb
    // can never actually reach.
    expect(labels).toEqual(["0", "3", "6", "9", "10"]);
  });

  it("does not render an out-of-range tick when (max-min)/step rounds up", () => {
    const { container } = render(
      <ElmSlider min={0} max={10} step={6} markers markerLabels />,
    );
    const labels = Array.from(
      container.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // (10-0)/6 = 1.666..., which Math.round rounds up to 2, generating a
    // spurious "12" tick outside [min, max] that overlaps the forced max=10
    // tick. Only the real step-ticks (0, 6) plus the forced max (10) should
    // render.
    expect(labels).toEqual(["0", "6", "10"]);
  });

  it("moves by exactly one step from an off-grid controlled value", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <ElmSlider
        min={0}
        max={100}
        step={10}
        value={7}
        onValueChange={onValueChange}
      />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });

    // 7 is a legitimate off-grid controlled value (e.g. a persisted user
    // preference); a single ArrowRight must move by exactly `step` from the
    // current value (7 + 10 = 17), not re-quantize onto a grid anchored at
    // `min` (which would jump to 20).
    expect(onValueChange).toHaveBeenCalledWith(17);
  });

  it("seeds the uncontrolled initial value verbatim, without re-quantizing it onto the step grid", () => {
    // Same off-grid-preservation contract this file already enforces for a
    // controlled `value` (see "moves by exactly one step from an off-grid
    // controlled value") must also hold for the uncontrolled seed: an
    // explicit, legitimately off-grid `defaultValue` (e.g. a persisted
    // preference) must be honored as-is, not silently rewritten onto a
    // step-10 grid anchored at `min` (which would produce 10 instead of 7).
    const { container: withDefault } = render(
      <ElmSlider step={10} defaultValue={7} />,
    );
    expect(slider(withDefault).getAttribute("aria-valuenow")).toBe("7");

    // With no `defaultValue` at all, the JSDoc on `defaultValue` and the
    // Storybook docs both promise the true midpoint of the range
    // (100 / 2 = 50), not a value re-quantized onto a step-7 grid anchored
    // at `min` (which would produce 49).
    const { container: atMidpoint } = render(<ElmSlider step={7} />);
    expect(slider(atMidpoint).getAttribute("aria-valuenow")).toBe("50");
  });

  it("moves on the first keypress from a controlled value sitting above innerMax", () => {
    const Harness = () => {
      const [value, setValue] = useState(95);
      return (
        <ElmSlider
          min={0}
          max={100}
          innerMin={0}
          innerMax={80}
          step={1}
          value={value}
          onValueChange={setValue}
        />
      );
    };

    const { container } = render(<Harness />);
    const el = slider(container);

    // aria-valuenow is correctly clamped for display before any interaction.
    expect(el.getAttribute("aria-valuenow")).toBe("80");

    // The very first ArrowLeft must decrease the *displayed* value by one
    // step (80 -> 79), not compute from the raw out-of-range controlled
    // value (95 -> clampValue(94) = 80, i.e. no visible change).
    fireEvent.keyDown(el, { key: "ArrowLeft" });
    expect(el.getAttribute("aria-valuenow")).toBe("79");
  });

  it("composes a caller-supplied onKeyDown with the slider's own keyboard handling", () => {
    const onKeyDownSpy = vi.fn();
    const { container } = render(
      <ElmSlider defaultValue={50} onKeyDown={onKeyDownSpy} />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });

    // `rest` (which carries the caller's onKeyDown) is spread before the
    // component's own onKeyDown in the same JSX element, so the caller's
    // handler is silently overwritten instead of composed.
    expect(onKeyDownSpy).toHaveBeenCalledTimes(1);
    expect(Number(el.getAttribute("aria-valuenow"))).toBe(51);
  });

  it("respects a caller-supplied tabIndex instead of forcing it from `disabled`", () => {
    const { container } = render(<ElmSlider tabIndex={-1} />);
    const el = slider(container);

    // `tabIndex={disabled ? -1 : 0}` is set on the same element after
    // `{...rest}` is spread, so it always overwrites `rest.tabIndex` — even
    // when the caller deliberately opts the slider out of the tab order
    // (e.g. a roving-tabindex composite widget where a parent toolbar/group
    // manages which control is focusable).
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("still renders tick marks when step is negative", () => {
    const { container } = render(
      <ElmSlider min={0} max={20} step={-4} markers />,
    );
    // `step` is a granularity everywhere else in this component (snap() and
    // the keyboard handler both use Math.abs(step)) — the marks memo must
    // treat it the same way instead of early-returning `[]` for a raw
    // negative step. Expect ticks at 0, 4, 8, 12, 16, 20.
    const ticks = container.querySelectorAll('[class*="tick"]');
    expect(ticks).toHaveLength(6);
  });

  it("does not invoke a caller-supplied onKeyDown when disabled", () => {
    const onKeyDownSpy = vi.fn();
    const { container } = render(
      <ElmSlider disabled defaultValue={50} onKeyDown={onKeyDownSpy} />,
    );
    const el = slider(container);

    fireEvent.keyDown(el, { key: "ArrowRight" });

    // The internal handler correctly no-ops on `disabled`, but the composed
    // handler still unconditionally calls the caller's onKeyDown afterward —
    // a caller relying on `disabled` to fully suppress interaction (e.g.
    // analytics, a toast) must not see it fire.
    expect(el.getAttribute("aria-valuenow")).toBe("50");
    expect(onKeyDownSpy).not.toHaveBeenCalled();
  });

  it("honors innerMin/innerMax/defaultValue instead of collapsing to max when min > max", () => {
    const { container } = render(
      <ElmSlider
        min={100}
        max={0}
        innerMin={20}
        innerMax={80}
        defaultValue={50}
      />,
    );
    const el = slider(container);

    // A reversed range (min > max) is a legitimate declining track —
    // ratioOf already treats it as a valid interpolation — so clamping the
    // inner bounds must not assume `lo <= hi` and silently force
    // effectiveInnerMin/effectiveInnerMax (and therefore the seeded
    // defaultValue) down to `max` regardless of the caller's props.
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
    expect(el.getAttribute("aria-valuenow")).toBe("50");

    // The control must not be frozen: a step still moves the value.
    fireEvent.keyDown(el, { key: "ArrowLeft" });
    expect(el.getAttribute("aria-valuenow")).toBe("49");
  });

  it("does not collapse to a single point when min > max and innerMin/innerMax are omitted", () => {
    const { container } = render(
      <ElmSlider min={100} max={0} defaultValue={30} />,
    );
    const el = slider(container);

    // With innerMin/innerMax omitted, the documented defaults ("min" /
    // "max") must resolve against the logical [low, high] span (0, 100),
    // not the raw, possibly-reversed `min`/`max` values themselves —
    // otherwise the default innerMax (the raw `max`, here the smaller
    // number) gets clamped *up* to innerMin instead of down to the
    // range's actual high end, collapsing the whole track to one point.
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
    expect(el.getAttribute("aria-valuenow")).toBe("30");
  });

  it("still renders tick marks for a reversed range (min > max)", () => {
    // `marks`' guard treated any `max <= min` as an empty range, silently
    // dropping every tick/label even though a reversed range is a legitimate
    // declining track elsewhere in this component (see the two tests above).
    const { container } = render(
      <ElmSlider min={100} max={0} step={10} markers markerLabels />,
    );

    const ticks = container.querySelectorAll('[class*="tick"]');
    const labels = container.querySelectorAll('[class*="mark-label"]');
    expect(ticks.length).toBe(11);
    expect(Array.from(labels).map((l) => l.textContent)).toEqual([
      "100",
      "90",
      "80",
      "70",
      "60",
      "50",
      "40",
      "30",
      "20",
      "10",
      "0",
    ]);
  });
});

describe("[SSR] ElmSlider", () => {
  it("renders the slider role in the server shell", () => {
    const html = renderToStaticMarkup(<ElmSlider defaultValue={40} />);
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="40"');
  });
});
