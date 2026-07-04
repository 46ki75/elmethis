import { describe, expect, test, vi } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { component$, useSignal } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmSlider } from "./elm-slider";

// CSS Modules mangle authored class names to `_<name>_<hash>`, so target the
// interactive element by its ARIA role — that's how a real consumer (and
// assistive tech) would find it too.
const SLIDER = '[role="slider"]';

const slider = (screen: { querySelector: (s: string) => Element | null }) =>
  screen.querySelector(SLIDER) as HTMLElement;

// createDOM's bundled CSS parser throws (`Cannot read properties of
// undefined (reading 'type')`) on ANY `element.style.getPropertyValue(...)`
// call for a custom property, regardless of the declaration's shape — a
// limitation of the test harness's CSSOM implementation, not this component.
// Read the raw `style` attribute string and regex-match the declaration
// instead of going through the live CSSOM.
const customProperty = (el: Element, name: string): string | null => {
  const raw = el.getAttribute("style") ?? "";
  const match = raw.match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`));
  return match ? match[1].trim() : null;
};

describe("[CSR] ElmSlider — rendering", () => {
  test("defaults to horizontal, min 0, max 100, midpoint value", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider />);
    const el = slider(screen);
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  test("renders vertical orientation", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider orientation="vertical" />);
    expect(slider(screen).getAttribute("aria-orientation")).toBe("vertical");
  });

  test("defaultValue seeds the uncontrolled value", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider defaultValue={30} />);
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("30");
  });

  test("clamps aria-valuemin/max to the inner range", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider innerMin={20} innerMax={80} defaultValue={50} />);
    const el = slider(screen);
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
  });

  test("clamps an out-of-inner-range defaultValue on mount", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider innerMin={20} innerMax={80} defaultValue={5} />);
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("20");
  });

  test("aria-disabled and tabIndex reflect the disabled prop", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider disabled />);
    const el = slider(screen);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  test("renders one tick per step when markers is set", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={0} max={100} step={25} markers />);
    // 0, 25, 50, 75, 100
    expect(screen.querySelectorAll("i")).toHaveLength(5);
  });

  test("renders marker labels with the formatted value", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmSlider
        min={0}
        max={100}
        step={50}
        markers
        markerLabels
        formatMarkerLabel={(v) => `${v}%`}
      />,
    );
    expect(screen.outerHTML).toContain("0%");
    expect(screen.outerHTML).toContain("50%");
    expect(screen.outerHTML).toContain("100%");
  });
});

describe("[CSR] ElmSlider — keyboard interaction", () => {
  test("ArrowRight/ArrowUp increases the value by step", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider defaultValue={50} step={5} />);

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("55");

    await userEvent(SLIDER, "keydown", { key: "ArrowUp" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("60");
  });

  test("ArrowLeft/ArrowDown decreases the value by step", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider defaultValue={50} step={5} />);

    await userEvent(SLIDER, "keydown", { key: "ArrowLeft" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("45");

    await userEvent(SLIDER, "keydown", { key: "ArrowDown" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("40");
  });

  test("PageUp/PageDown move by ten steps", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider defaultValue={50} step={2} />);

    await userEvent(SLIDER, "keydown", { key: "PageUp" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("70");

    await userEvent(SLIDER, "keydown", { key: "PageDown" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("50");
  });

  test("Home/End jump to the inner bounds", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider innerMin={20} innerMax={80} defaultValue={50} />);

    await userEvent(SLIDER, "keydown", { key: "End" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("80");

    await userEvent(SLIDER, "keydown", { key: "Home" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("20");
  });

  test("does not move past the inner bounds", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmSlider innerMin={0} innerMax={100} defaultValue={98} step={5} />,
    );

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("100");
  });

  test("does not respond to keyboard input when disabled", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider defaultValue={50} disabled />);

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("50");
  });

  // Regression: the internal onKeyDown$'s `disabled` guard lives inside the
  // exact same handler that `{...rest}` fully overwrites when a caller
  // supplies its own onKeyDown$ (the "caller wins outright" convention — see
  // "a caller-supplied onKeyDown$ fully replaces the internal keyboard
  // handling" below). That let a caller-supplied handler run — and the
  // slider's own stepping still needed to stay inert — even while `disabled`
  // is true, unlike the sibling test above.
  test("ignores a caller-supplied onKeyDown$ when disabled", async () => {
    const onKeyDownSpy = vi.fn();
    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmSlider defaultValue={50} disabled onKeyDown$={onKeyDownSpy} />,
    );

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });

    expect(onKeyDownSpy).not.toHaveBeenCalled();
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("50");
  });

  test("writes through to a bound parent signal", async () => {
    const Harness = component$(() => {
      const value = useSignal(50);
      return (
        <div>
          <output data-testid="state">{value.value}</output>
          <ElmSlider value={value} step={10} />
        </div>
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });

    await vi.waitFor(() =>
      expect(screen.querySelector('[data-testid="state"]')?.textContent).toBe(
        "60",
      ),
    );
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("60");
  });
});

// Regression coverage for the algorithm's hardened edge cases (ported from
// the react suite's "known bugs (regression)" describe block — these already
// hold in this qwik port, they aren't currently-failing bugs here).
describe("[CSR] ElmSlider — hardened edge cases", () => {
  test("clamps a controlled value that falls outside the inner range", async () => {
    const Harness = component$(() => {
      const signal = useSignal(5);
      return <ElmSlider innerMin={20} innerMax={80} value={signal} />;
    });

    const { screen, render } = await createDOM();
    await render(<Harness />);
    const el = slider(screen);
    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(20);
  });

  test("formats marker labels without floating-point dust for a fractional step", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={0} max={1} step={0.1} markers markerLabels />);
    // 0 + 3*0.1 drifts to 0.30000000000000004 in JS float math.
    expect(screen.outerHTML).not.toMatch(/0\.30000/);
  });

  test("does not skip a tick due to floating-point step-count error", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmSlider min={0} max={0.3} step={0.1} markers markerLabels />,
    );
    const labels = Array.from(
      screen.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // Expect all 4 ticks: 0, 0.1, 0.2, 0.3. (0.3-0)/0.1 evaluates to
    // 2.9999999999999996 in JS float math, so a naive Math.floor undercounts
    // to 2 and drops the "0.2" tick, jumping straight from 0.1 to the forced
    // max=0.3.
    expect(labels).toHaveLength(4);
  });

  test("spans the full range instead of clustering near min when the tick count exceeds MAX_MARKERS", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={0} max={100} step={0.01} markers />);
    const marks = screen.querySelectorAll('[class*="mark"]');
    const last = marks[marks.length - 1] as HTMLElement;
    const lastRatio = Number(
      customProperty(last, "--elmethis-scoped-marker-ratio"),
    );
    // The capped 501 rendered ticks should still stretch across [min, max].
    expect(lastRatio).toBeCloseTo(1, 5);
  });

  test("sizes the vertical label reservation to a JSX-returning formatMarkerLabel's rendered text, not String(value)", async () => {
    const { screen, render } = await createDOM();
    await render(
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
    const wrapper = screen.querySelector(
      '[class*="elm-slider"]',
    ) as HTMLElement;
    const chars = Number(
      customProperty(wrapper, "--elmethis-scoped-max-marker-label-chars"),
    );
    // "100 units of measurement" is 25 chars; falling back to String(100)
    // (3 chars) would under-reserve the padding and let the label overflow.
    expect(chars).toBe("100 units of measurement".length);
  });

  test("ArrowRight increases the value even when step is negative", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider defaultValue={50} step={-10} />);

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });

    expect(
      Number(slider(screen).getAttribute("aria-valuenow")),
    ).toBeGreaterThan(50);
  });

  test("forwards aria-label to the slider element, not an outer wrapper", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider aria-label="Volume" />);
    expect(slider(screen).getAttribute("aria-label")).toBe("Volume");
  });

  test("renders tick/label values on the actual step grid, not an evenly-resampled one", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={0} max={10} step={3} markers markerLabels />);
    const labels = Array.from(
      screen.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // step=3 over [0, 10] only ever snaps to 0, 3, 6, 9 (plus the forced
    // max=10); it must never render 3.3333.../6.6666... ticks the thumb can
    // never actually reach.
    expect(labels).toEqual(["0", "3", "6", "9", "10"]);
  });

  test("does not render an out-of-range tick when (max-min)/step rounds up", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={0} max={10} step={6} markers markerLabels />);
    const labels = Array.from(
      screen.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    // (10-0)/6 = 1.666..., which a naive Math.round rounds up to 2,
    // generating a spurious "12" tick outside [min, max] that overlaps the
    // forced max=10 tick. Only the real step-ticks (0, 6) plus the forced
    // max (10) should render.
    expect(labels).toEqual(["0", "6", "10"]);
  });

  test("moves by exactly one step from an off-grid controlled value", async () => {
    const Harness = component$(() => {
      const value = useSignal(7);
      return <ElmSlider min={0} max={100} step={10} value={value} />;
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });

    // 7 is a legitimate off-grid controlled value (e.g. a persisted user
    // preference); a single ArrowRight must move by exactly `step` from the
    // current value (7 + 10 = 17), not re-quantize onto a grid anchored at
    // `min` (which would jump to 20).
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("17");
  });

  test("seeds the uncontrolled initial value verbatim, without re-quantizing it onto the step grid", async () => {
    const { screen: withDefault, render: renderWithDefault } =
      await createDOM();
    await renderWithDefault(<ElmSlider step={10} defaultValue={7} />);
    expect(slider(withDefault).getAttribute("aria-valuenow")).toBe("7");

    // With no `defaultValue` at all, the JSDoc on `defaultValue` and the
    // Storybook docs both promise the true midpoint of the range
    // (100 / 2 = 50), not a value re-quantized onto a step-7 grid anchored
    // at `min` (which would produce 49).
    const { screen: atMidpoint, render: renderAtMidpoint } = await createDOM();
    await renderAtMidpoint(<ElmSlider step={7} />);
    expect(slider(atMidpoint).getAttribute("aria-valuenow")).toBe("50");
  });

  test("moves on the first keypress from a controlled value sitting above innerMax", async () => {
    const Harness = component$(() => {
      const value = useSignal(95);
      return (
        <ElmSlider
          min={0}
          max={100}
          innerMin={0}
          innerMax={80}
          step={1}
          value={value}
        />
      );
    });

    const { screen, render, userEvent } = await createDOM();
    await render(<Harness />);

    // aria-valuenow is correctly clamped for display before any interaction.
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("80");

    // The very first ArrowLeft must decrease the *displayed* value by one
    // step (80 -> 79), not compute from the raw out-of-range controlled
    // value (95 -> clampToInner(94) = 80, i.e. no visible change).
    await userEvent(SLIDER, "keydown", { key: "ArrowLeft" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("79");
  });

  test("a caller-supplied onKeyDown$ fully replaces the internal keyboard handling", async () => {
    // `{...rest}` (which carries a caller's onKeyDown$) is spread after the
    // component's own onKeyDown$ on the same JSX element — the established
    // convention across this package (see elm-checkbox.tsx, elm-switch.tsx)
    // is that the caller's handler wins outright rather than composing with
    // the internal one.
    const onKeyDownSpy = vi.fn();
    const { screen, render, userEvent } = await createDOM();
    await render(<ElmSlider defaultValue={50} onKeyDown$={onKeyDownSpy} />);

    await userEvent(SLIDER, "keydown", { key: "ArrowRight" });

    expect(onKeyDownSpy).toHaveBeenCalledTimes(1);
    // The internal stepping logic never ran — the caller's handler replaced
    // it outright.
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("50");
  });

  test("respects a caller-supplied tabIndex instead of forcing it from disabled", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider tabIndex={-1} />);
    expect(slider(screen).getAttribute("tabindex")).toBe("-1");
  });

  test("still renders tick marks when step is negative", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={0} max={20} step={-4} markers />);
    // `step` is a granularity everywhere else in this component (snapValue()
    // and the keyboard handler both use Math.abs(step)) — marks must treat
    // it the same way instead of early-returning `[]` for a raw negative
    // step. Expect ticks at 0, 4, 8, 12, 16, 20.
    const ticks = screen.querySelectorAll('[class*="tick"]');
    expect(ticks).toHaveLength(6);
  });

  test("honors innerMin/innerMax/defaultValue instead of collapsing to max when min > max", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(
      <ElmSlider
        min={100}
        max={0}
        innerMin={20}
        innerMax={80}
        defaultValue={50}
      />,
    );
    const el = slider(screen);

    // A reversed range (min > max) is a legitimate declining track — ratioOf
    // already treats it as a valid interpolation — so clamping the inner
    // bounds must not assume `lo <= hi` and silently force
    // effectiveInnerMin/effectiveInnerMax (and therefore the seeded
    // defaultValue) down to `max` regardless of the caller's props.
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
    expect(el.getAttribute("aria-valuenow")).toBe("50");

    // The control must not be frozen: a step still moves the value.
    await userEvent(SLIDER, "keydown", { key: "ArrowLeft" });
    expect(slider(screen).getAttribute("aria-valuenow")).toBe("49");
  });

  test("does not collapse to a single point when min > max and innerMin/innerMax are omitted", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSlider min={100} max={0} defaultValue={30} />);
    const el = slider(screen);

    // With innerMin/innerMax omitted, the documented defaults ("min" /
    // "max") must resolve against the logical [low, high] span (0, 100),
    // not the raw, possibly-reversed `min`/`max` values themselves —
    // otherwise the default innerMax (the raw `max`, here the smaller
    // number) gets clamped *up* to innerMin instead of down to the range's
    // actual high end, collapsing the whole track to one point.
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
    expect(el.getAttribute("aria-valuenow")).toBe("30");
  });

  test("still renders tick marks for a reversed range (min > max)", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmSlider min={100} max={0} step={10} markers markerLabels />,
    );
    // `buildMarks`'s empty-range guard must only reject a truly empty range
    // (max === min), not any `max <= min` — a reversed/declining range
    // (min > max) is a legitimate track (see `ratioOf`'s plain
    // interpolation and the innerMin/innerMax hardening above), so ticks
    // must still render walking down from 100 to 0: 100, 90, ..., 0.
    const ticks = screen.querySelectorAll('[class*="tick"]');
    expect(ticks).toHaveLength(11);
    const labels = Array.from(
      screen.querySelectorAll('[class*="mark-label"]'),
    ).map((el) => el.textContent);
    expect(labels).toEqual([
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
  test("renders the slider role in the server shell", async () => {
    const { html } = await renderToString(<ElmSlider defaultValue={40} />, {
      containerTagName: "div",
    });
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="40"');
  });
});
