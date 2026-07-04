import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, defineComponent, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmSlider } from "./elm-slider";

const slider = (wrapper: { element: Element }) =>
  wrapper.element.querySelector('[role="slider"]') as HTMLElement;

describe("[CSR] ElmSlider — rendering", () => {
  it("defaults to horizontal, min 0, max 100, midpoint value", () => {
    const wrapper = mount(ElmSlider);
    const el = slider(wrapper);
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("renders vertical orientation", () => {
    const wrapper = mount(ElmSlider, {
      props: { orientation: "vertical" },
    });
    expect(slider(wrapper).getAttribute("aria-orientation")).toBe("vertical");
  });

  it("defaultValue seeds the uncontrolled value", () => {
    const wrapper = mount(ElmSlider, { props: { defaultValue: 30 } });
    expect(slider(wrapper).getAttribute("aria-valuenow")).toBe("30");
  });

  it("clamps aria-valuemin/max to the inner range", () => {
    const wrapper = mount(ElmSlider, {
      props: { innerMin: 20, innerMax: 80, defaultValue: 50 },
    });
    const el = slider(wrapper);
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
  });

  it("clamps an out-of-inner-range defaultValue on mount", () => {
    const wrapper = mount(ElmSlider, {
      props: { innerMin: 20, innerMax: 80, defaultValue: 5 },
    });
    expect(slider(wrapper).getAttribute("aria-valuenow")).toBe("20");
  });

  it("aria-disabled and tabindex reflect the disabled prop", () => {
    const wrapper = mount(ElmSlider, { props: { disabled: true } });
    const el = slider(wrapper);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("renders one tick per step when markers is set", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 0, max: 100, step: 25, markers: true },
    });
    // 0, 25, 50, 75, 100
    expect(wrapper.findAll("i")).toHaveLength(5);
  });

  it("renders marker labels with the formatted value", () => {
    const wrapper = mount(ElmSlider, {
      props: {
        min: 0,
        max: 100,
        step: 50,
        markers: true,
        markerLabels: true,
        formatMarkerLabel: (v: number) => `${v}%`,
      },
    });
    expect(wrapper.text()).toContain("0%");
    expect(wrapper.text()).toContain("50%");
    expect(wrapper.text()).toContain("100%");
  });
});

describe("[CSR] ElmSlider — keyboard interaction", () => {
  it("ArrowRight/ArrowUp increases the value by step", async () => {
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50, step: 5 },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("55");

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("60");
  });

  it("ArrowLeft/ArrowDown decreases the value by step", async () => {
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50, step: 5 },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("45");

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("40");
  });

  it("Home/End jump to the inner bounds", async () => {
    const wrapper = mount(ElmSlider, {
      props: { innerMin: 20, innerMax: 80, defaultValue: 50 },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("80");

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("20");
  });

  it("does not move past the inner bounds", async () => {
    const wrapper = mount(ElmSlider, {
      props: { innerMin: 0, innerMax: 100, defaultValue: 98, step: 5 },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("100");
  });

  it("does not respond to keyboard input when disabled", async () => {
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50, disabled: true },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("writes through to a bound parent value (v-model round trip)", async () => {
    const Harness = defineComponent({
      setup() {
        const value = ref(50);
        return () =>
          h("div", [
            h("output", String(value.value)),
            h(ElmSlider, {
              value: value.value,
              step: 10,
              "onUpdate:value": (v: number) => (value.value = v),
            }),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(wrapper.find("output").text()).toBe("60");
    expect(el.getAttribute("aria-valuenow")).toBe("60");
  });
});

describe("[CSR] ElmSlider — hardened edge cases", () => {
  it("clamps a controlled value that falls outside the inner range", () => {
    const wrapper = mount(ElmSlider, {
      props: {
        innerMin: 20,
        innerMax: 80,
        value: 5,
        "onUpdate:value": () => {},
      },
    });
    const el = slider(wrapper);
    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(20);
  });

  it("formats marker labels without floating-point dust for a fractional step", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 0, max: 1, step: 0.1, markers: true, markerLabels: true },
    });
    // 0 + 3*0.1 drifts to 0.30000000000000004 in JS float math.
    expect(wrapper.text()).not.toMatch(/0\.30000/);
  });

  it("does not skip a tick due to floating-point step-count error", () => {
    const wrapper = mount(ElmSlider, {
      props: {
        min: 0,
        max: 0.3,
        step: 0.1,
        markers: true,
        markerLabels: true,
      },
    });
    const labels = wrapper
      .findAll('[class*="mark-label"]')
      .map((el) => el.text());
    // Expect all 4 ticks: 0, 0.1, 0.2, 0.3. (0.3-0)/0.1 evaluates to
    // 2.9999999999999996 in JS float math, so Math.floor would undercount
    // to 2 and drop the "0.2" tick, jumping straight from 0.1 to the forced
    // max=0.3.
    expect(labels).toHaveLength(4);
  });

  it("spans the full range instead of clustering near min when the tick count exceeds MAX_MARKERS", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 0, max: 100, step: 0.01, markers: true },
    });
    const marks = wrapper.findAll('[class*="mark"]');
    const last = marks[marks.length - 1];
    const lastRatio = Number(
      (last.element as HTMLElement).style.getPropertyValue(
        "--elmethis-scoped-marker-ratio",
      ),
    );
    // The capped 501 rendered ticks should still stretch across [min, max].
    expect(lastRatio).toBeCloseTo(1, 5);
  });

  it("sizes the vertical label reservation to a vnode-returning formatMarkerLabel's rendered text, not String(value)", () => {
    const wrapper = mount(ElmSlider, {
      props: {
        orientation: "vertical",
        min: 0,
        max: 100,
        step: 25,
        markers: true,
        markerLabels: true,
        formatMarkerLabel: (v: number) => (
          <strong>{v} units of measurement</strong>
        ),
      },
    });
    const wrapperEl = wrapper.find('[class*="elm-slider"]')
      .element as HTMLElement;
    const chars = Number(
      wrapperEl.style.getPropertyValue(
        "--elmethis-scoped-max-marker-label-chars",
      ),
    );
    // "100 units of measurement" is 25 chars; falling back to String(100)
    // (3 chars) would under-reserve the padding and let the label overflow.
    expect(chars).toBe("100 units of measurement".length);
  });

  it("ArrowRight increases the value even when step is negative", async () => {
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50, step: -10 },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(Number(el.getAttribute("aria-valuenow"))).toBeGreaterThan(50);
  });

  it("forwards aria-label to the slider element, not an outer wrapper", () => {
    const wrapper = mount(ElmSlider, {
      attrs: { "aria-label": "Volume" },
    });
    expect(slider(wrapper).getAttribute("aria-label")).toBe("Volume");
  });

  it("applies a caller-supplied class/style to the outer wrapper, not the inner track", () => {
    const wrapper = mount(ElmSlider, {
      attrs: { class: "my-class", style: { margin: "1rem" } },
    });
    const outer = wrapper.find('[class*="elm-slider"]').element as HTMLElement;
    const track = slider(wrapper);

    // Mirrors the React port: `className`/`style` land on the outer
    // `.elm-slider` wrapper, exactly like `rest` (aria-label, data-*, ...)
    // lands on the inner track.
    expect(outer.classList.contains("my-class")).toBe(true);
    expect(outer.style.margin).toBe("1rem");

    expect(track.classList.contains("my-class")).toBe(false);
    expect(track.style.margin).toBe("");
  });

  it("renders tick/label values on the actual step grid, not an evenly-resampled one", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 0, max: 10, step: 3, markers: true, markerLabels: true },
    });
    const labels = wrapper
      .findAll('[class*="mark-label"]')
      .map((el) => el.text());
    // step=3 over [0, 10] only ever snaps to 0, 3, 6, 9 (plus the forced
    // max=10); it must never render 3.3333.../6.6666... ticks the thumb
    // can never actually reach.
    expect(labels).toEqual(["0", "3", "6", "9", "10"]);
  });

  it("does not render an out-of-range tick when (max-min)/step rounds up", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 0, max: 10, step: 6, markers: true, markerLabels: true },
    });
    const labels = wrapper
      .findAll('[class*="mark-label"]')
      .map((el) => el.text());
    // (10-0)/6 = 1.666..., which Math.round rounds up to 2, generating a
    // spurious "12" tick outside [min, max] that overlaps the forced max=10
    // tick. Only the real step-ticks (0, 6) plus the forced max (10) should
    // render.
    expect(labels).toEqual(["0", "6", "10"]);
  });

  it("moves by exactly one step from an off-grid controlled value", async () => {
    const onUpdate = vi.fn();
    const wrapper = mount(ElmSlider, {
      props: {
        min: 0,
        max: 100,
        step: 10,
        value: 7,
        "onUpdate:value": onUpdate,
      },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    // 7 is a legitimate off-grid controlled value (e.g. a persisted user
    // preference); a single ArrowRight must move by exactly `step` from the
    // current value (7 + 10 = 17), not re-quantize onto a grid anchored at
    // `min` (which would jump to 20).
    expect(onUpdate).toHaveBeenCalledWith(17);
  });

  it("seeds the uncontrolled initial value verbatim, without re-quantizing it onto the step grid", () => {
    // Same off-grid-preservation contract already enforced above for a
    // controlled `value` must also hold for the uncontrolled seed: an
    // explicit, legitimately off-grid `defaultValue` (e.g. a persisted
    // preference) must be honored as-is, not silently rewritten onto a
    // step-10 grid anchored at `min` (which would produce 10 instead of 7).
    const withDefault = mount(ElmSlider, {
      props: { step: 10, defaultValue: 7 },
    });
    expect(slider(withDefault).getAttribute("aria-valuenow")).toBe("7");

    // With no `defaultValue` at all, the JSDoc on `defaultValue` and the
    // Storybook docs both promise the true midpoint of the range
    // (100 / 2 = 50), not a value re-quantized onto a step-7 grid anchored
    // at `min` (which would produce 49).
    const atMidpoint = mount(ElmSlider, { props: { step: 7 } });
    expect(slider(atMidpoint).getAttribute("aria-valuenow")).toBe("50");
  });

  it("moves on the first keypress from a controlled value sitting above innerMax", async () => {
    const Harness = defineComponent({
      setup() {
        const value = ref(95);
        return () =>
          h(ElmSlider, {
            min: 0,
            max: 100,
            innerMin: 0,
            innerMax: 80,
            step: 1,
            value: value.value,
            "onUpdate:value": (v: number) => (value.value = v),
          });
      },
    });

    const wrapper = mount(Harness);
    const el = slider(wrapper);

    // aria-valuenow is correctly clamped for display before any interaction.
    expect(el.getAttribute("aria-valuenow")).toBe("80");

    // The very first ArrowLeft must decrease the *displayed* value by one
    // step (80 -> 79), not compute from the raw out-of-range controlled
    // value (95 -> clampValue(94) = 80, i.e. no visible change).
    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("79");
  });

  it("does not let a caller-supplied aria-valuenow (via attrs) override the slider's own computed value", () => {
    // `attrs` (aria-valuenow, role, aria-orientation, aria-valuemin/max,
    // aria-disabled, ...) is fallthrough content spread onto the track
    // element — it must never be able to overwrite the slider's own
    // internally-computed ARIA state, which is what actually reflects the
    // real, current value/orientation/bounds.
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50 },
      attrs: { "aria-valuenow": 999, role: "button" },
    });
    const el = wrapper.element.querySelector(
      "[aria-orientation]",
    ) as HTMLElement;

    expect(el.getAttribute("role")).toBe("slider");
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("respects a caller-supplied tabindex instead of forcing it from `disabled`", () => {
    const wrapper = mount(ElmSlider, { attrs: { tabindex: -1 } });
    const el = slider(wrapper);

    // `attrs` is spread onto the track element after its explicit
    // `tabindex={disabled ? -1 : 0}`, so a caller-supplied `tabindex`
    // overrides it — even when the caller deliberately opts the slider out
    // of the tab order (e.g. a roving-tabindex composite widget).
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("composes a caller-supplied onKeydown (via attrs) with the slider's own keyboard handling", async () => {
    // `inheritAttrs: false` + spreading `{...rest}` on the interactive
    // element, combined with a JSX literal `onKeydown` on the same element,
    // compiles to Vue's `mergeProps` (see elm-checkbox.tsx / elm-switch.tsx
    // for the same pattern) — same-named event handlers are *composed*
    // (both invoked), not silently replaced, unlike plain object-spread
    // overwrite semantics.
    const onKeydownSpy = vi.fn();
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50 },
      attrs: { onKeydown: onKeydownSpy },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(onKeydownSpy).toHaveBeenCalledTimes(1);
    expect(el.getAttribute("aria-valuenow")).toBe("51");
  });

  it("does not invoke a caller-supplied onKeydown (via attrs) when disabled", async () => {
    // Mirrors the React port's contract (elm-slider.spec.tsx, "does not
    // invoke a caller-supplied onKeyDown when disabled"): `disabled` must
    // fully suppress interaction, including a caller-attached handler that
    // `mergeProps` would otherwise compose in unconditionally. A caller
    // relying on `disabled` to suppress interaction (e.g. analytics, a
    // toast) must not see it fire.
    const onKeydownSpy = vi.fn();
    const wrapper = mount(ElmSlider, {
      props: { defaultValue: 50, disabled: true },
      attrs: { onKeydown: onKeydownSpy },
    });
    const el = slider(wrapper);

    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    expect(onKeydownSpy).not.toHaveBeenCalled();
    expect(el.getAttribute("aria-valuenow")).toBe("50");
  });

  it("still renders tick marks when step is negative", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 0, max: 20, step: -4, markers: true },
    });
    // `step` is a granularity everywhere else in this component (snap() and
    // the keyboard handler both use Math.abs(step)) — the marks computed
    // must treat it the same way instead of early-returning `[]` for a raw
    // negative step. Expect ticks at 0, 4, 8, 12, 16, 20.
    const ticks = wrapper.findAll('[class*="tick"]');
    expect(ticks).toHaveLength(6);
  });

  it("honors innerMin/innerMax/defaultValue instead of collapsing to max when min > max", async () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 100, max: 0, innerMin: 20, innerMax: 80, defaultValue: 50 },
    });
    const el = slider(wrapper);

    // A reversed range (min > max) is a legitimate declining track —
    // ratioOf already treats it as a valid interpolation — so clamping the
    // inner bounds must not assume `lo <= hi` and silently force
    // effectiveInnerMin/effectiveInnerMax (and therefore the seeded
    // defaultValue) down to `max` regardless of the caller's props.
    expect(el.getAttribute("aria-valuemin")).toBe("20");
    expect(el.getAttribute("aria-valuemax")).toBe("80");
    expect(el.getAttribute("aria-valuenow")).toBe("50");

    // The control must not be frozen: a step still moves the value.
    await el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );
    expect(el.getAttribute("aria-valuenow")).toBe("49");
  });

  it("does not collapse to a single point when min > max and innerMin/innerMax are omitted", () => {
    const wrapper = mount(ElmSlider, {
      props: { min: 100, max: 0, defaultValue: 30 },
    });
    const el = slider(wrapper);

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
});

describe("[SSR] ElmSlider", () => {
  it("renders the slider role in the server shell", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmSlider, { defaultValue: 40 }) }),
    );
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="40"');
  });
});
