import {
  component$,
  type CSSProperties,
  type JSXOutput,
  type PropsOf,
  type Signal,
} from "@qwik.dev/core";

import { useBindableSignal } from "../../hooks/use-bindable-signal";
import styles from "./elm-slider.module.css";

export type ElmSliderOrientation = "horizontal" | "vertical";

export interface ElmSliderProps extends PropsOf<"div"> {
  /**
   * Lower bound of the track's full range.
   *
   * @defaultValue 0
   */
  min?: number;

  /**
   * Upper bound of the track's full range.
   *
   * @defaultValue 100
   */
  max?: number;

  /**
   * Increment the value snaps to while dragging or using the keyboard.
   *
   * @defaultValue 1
   */
  step?: number;

  /**
   * Restricts the value to an interval inside the track's full length. Must
   * be `>= min`. The track still spans `[min, max]`, but the region below
   * `innerMin` is shown as unreachable.
   *
   * @defaultValue min
   */
  innerMin?: number;

  /**
   * Restricts the value to an interval inside the track's full length. Must
   * be `<= max`.
   *
   * @defaultValue max
   */
  innerMax?: number;

  /**
   * Track direction.
   *
   * @defaultValue "horizontal"
   */
  orientation?: ElmSliderOrientation;

  /**
   * Controlled value. When provided the parent owns the signal — writes go
   * straight through to it. There is no separate `onValueChange` callback:
   * bind a `Signal<number>` here and read/observe it on the parent side.
   */
  value?: Signal<number>;

  /**
   * Initial value when uncontrolled.
   *
   * @defaultValue the midpoint of `innerMin`/`innerMax`
   */
  defaultValue?: number;

  /**
   * Disables dragging, clicking, and keyboard control.
   */
  disabled?: boolean;

  /**
   * Draws a tick mark at every step along the track.
   */
  markers?: boolean;

  /**
   * Draws a text label under each tick mark.
   */
  markerLabels?: boolean;

  /**
   * Formats the content shown for a marker label.
   *
   * Intentionally a plain (non-`$`) function rather than a `QRL`: it must be
   * invoked synchronously during render to build each `.mark-label`'s
   * content — which is then also measured to size the vertical layout's
   * label-reservation padding via `--elmethis-scoped-max-marker-label-chars`.
   * `component$`'s render function (`OnRenderFn`) is typed to return
   * `JSXOutput` synchronously — not a `Promise` — so a `QRL` (which can only
   * be resolved with `await`) can't be threaded through this synchronous
   * computation without reaching for `useAsync$`/`<Suspense>`, which would be
   * a disproportionate amount of machinery for formatting a tick label. The
   * react and vue ports keep this the same shape (a plain sync formatter) for
   * the same reason.
   *
   * @defaultValue String(value)
   */
  formatMarkerLabel?: (value: number) => JSXOutput;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

// Rounds away float dust (e.g. 0 + 3 * 0.1 -> 0.30000000000000004).
const preciseRound = (n: number) => Math.round(n * 1e9) / 1e9;

// Guards against generating an unbounded number of DOM nodes if a caller
// pairs a tiny `step` with a wide `[min, max]`.
const MAX_MARKERS = 500;

const ratioOf = (v: number, min: number, max: number): number =>
  max === min ? 0 : clamp((v - min) / (max - min), 0, 1);

// `step` is a granularity, not a direction — mirrors the keyboard handler's
// `Math.abs(step)` so a negative step still quantizes (only `step === 0`
// means "no snapping").
const snapValue = (
  raw: number,
  min: number,
  step: number,
  innerMin: number,
  innerMax: number,
): number => {
  const magnitude = Math.abs(step);
  const stepped =
    magnitude > 0 ? min + Math.round((raw - min) / magnitude) * magnitude : raw;
  return clamp(preciseRound(stepped), innerMin, innerMax);
};

// Unlike `snapValue`, this does NOT re-quantize onto a grid anchored at
// `min` — it clamps a value that has already moved by exactly one step (or
// is a caller-supplied `value`/`defaultValue`) into the inner bounds. Used
// for keyboard stepping (the current value may legitimately be off-grid) and
// for seeding/displaying a possibly off-grid controlled value or
// `defaultValue` verbatim.
const clampToInner = (
  raw: number,
  innerMin: number,
  innerMax: number,
): number => clamp(preciseRound(raw), innerMin, innerMax);

const valueFromPointer = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  isVertical: boolean,
  min: number,
  max: number,
  step: number,
  innerMin: number,
  innerMax: number,
): number => {
  const ratio = isVertical
    ? rect.height === 0
      ? 0
      : clamp((rect.bottom - clientY) / rect.height, 0, 1)
    : rect.width === 0
      ? 0
      : clamp((clientX - rect.left) / rect.width, 0, 1);
  return snapValue(min + ratio * (max - min), min, step, innerMin, innerMax);
};

interface Mark {
  value: number;
  ratio: number;
}

// Walks the real step grid up to `MAX_MARKERS`, forcing a trailing tick at
// `max` if `step` doesn't evenly divide the range. Falls back to even
// resampling only past `MAX_MARKERS` (cosmetic-only ticks at that point —
// not all of them are reachable by `snapValue`, which is an acceptable
// trade-off once there are too many real ticks to render individually).
const buildMarks = (
  markers: boolean | undefined,
  markerLabels: boolean | undefined,
  step: number,
  min: number,
  max: number,
): Mark[] => {
  if (!markers && !markerLabels) return [];
  // `step` is a granularity, not a direction — mirror `snapValue()` and the
  // keyboard handler's `Math.abs(step)` so a negative step still renders
  // ticks (only `step === 0` or an empty range means "no ticks").
  const magnitude = Math.abs(step);
  if (magnitude <= 0 || max <= min) return [];
  // `preciseRound` absorbs float dust in (max-min)/step (e.g. 0.3/0.1 ->
  // 2.9999999999999996, which must count as 3) without rounding a genuine
  // fraction up to the next integer (e.g. 10/6 -> 1.6666666666666667 must
  // floor to 1, not round up to 2 and generate a tick beyond `max`).
  const realCount = Math.floor(preciseRound((max - min) / magnitude));
  const out: Mark[] = [];
  if (realCount <= MAX_MARKERS) {
    for (let i = 0; i <= realCount; i++) {
      const v = preciseRound(min + i * magnitude);
      out.push({ value: v, ratio: ratioOf(v, min, max) });
    }
    if (preciseRound(min + realCount * magnitude) !== preciseRound(max)) {
      out.push({ value: max, ratio: ratioOf(max, min, max) });
    }
  } else {
    const tickStep = (max - min) / MAX_MARKERS;
    for (let i = 0; i <= MAX_MARKERS; i++) {
      const v = i === MAX_MARKERS ? max : preciseRound(min + i * tickStep);
      out.push({ value: v, ratio: ratioOf(v, min, max) });
    }
  }
  return out;
};

// `formatMarkerLabel` is typed to return an arbitrary `JSXOutput` (elements,
// fragments, arrays, ...), not just a string/number — so measuring its
// length can't rely on `typeof`. Recursively concatenate the actual rendered
// text (a node's text length is its children's, not its own) so a
// JSX-returning formatter is measured by what it actually renders, not by a
// `String(mark.value)` fallback that ignores the formatter entirely.
const jsxOutputToText = (node: unknown): string => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(jsxOutputToText).join("");
  if (typeof node === "object" && "children" in node) {
    return jsxOutputToText((node as { children: unknown }).children);
  }
  // Signals/functions/regexes and anything else we can't statically measure
  // — better to under-report nothing extra than to throw.
  return "";
};

export const ElmSlider = component$<ElmSliderProps>((props) => {
  const {
    class: className,
    style,
    min = 0,
    max = 100,
    step = 1,
    innerMin,
    innerMax,
    orientation = "horizontal",
    value,
    defaultValue,
    disabled,
    markers,
    markerLabels,
    formatMarkerLabel,
    ...rest
  } = props;

  const isVertical = orientation === "vertical";

  // `clamp` assumes `lo <= hi`. `min`/`max` alone can't be passed straight
  // through as `[lo, hi]` because a reversed range (`min > max`, a
  // legitimate declining track — see `ratioOf`, which already handles it via
  // plain interpolation) would silently force both inner bounds down to
  // `max` instead of clamping into the declared range. Sort once so the
  // inner bounds are always resolved against the *logical* [low, high]
  // regardless of which of `min`/`max` is numerically larger. The *default*
  // for an omitted innerMin/innerMax must default to this same logical
  // [low, high] span too (not the raw `min`/`max`) — otherwise, for a
  // reversed range, the default innerMax (raw `max`, the smaller number)
  // sits below `rangeLow`/the default innerMin and gets clamped *up* to it
  // instead of down to the range's actual high end, collapsing the whole
  // track to a single point.
  const rangeLow = Math.min(min, max);
  const rangeHigh = Math.max(min, max);
  const effectiveInnerMin = clamp(innerMin ?? rangeLow, rangeLow, rangeHigh);
  const effectiveInnerMax = clamp(
    innerMax ?? rangeHigh,
    effectiveInnerMin,
    rangeHigh,
  );

  const currentValue = useBindableSignal<number>({
    signal: value,
    // Unlike pointer/keyboard-driven moves, the initial seed is not
    // something the user is actively snapping onto a grid — it's either a
    // caller's explicit, possibly-off-grid `defaultValue` (e.g. a persisted
    // preference) or the documented midpoint default. Both must be honored
    // verbatim, exactly like a controlled `value` is preserved off-grid
    // elsewhere — so only clamp into range here, don't `snapValue()`.
    defaultValue: clampToInner(
      defaultValue ?? (effectiveInnerMin + effectiveInnerMax) / 2,
      effectiveInnerMin,
      effectiveInnerMax,
    ),
  });

  // A controlling parent owns `currentValue` and may pass one outside the
  // inner range (e.g. set before `innerMin`/`innerMax` were added) — clamp
  // only for display so `aria-valuenow` and the thumb never report/render
  // outside the declared bounds, without writing back to the signal
  // ourselves.
  const displayValue = clamp(
    currentValue.value,
    effectiveInnerMin,
    effectiveInnerMax,
  );

  const marks = buildMarks(markers, markerLabels, step, min, max);

  // `.vertical.has-marker-labels` reserves `padding-right` to fit the tick,
  // the gap, and the label itself — but the label's *width* scales with its
  // character count (unlike the horizontal orientation, where the reserved
  // `padding-block-end` only ever needs a label's roughly-constant
  // line-height). Measure the longest rendered label so the CSS can size the
  // reservation to it via `ch` (exact for `.mark-label`'s monospace font)
  // instead of a fixed constant that only fits short labels. Each mark's
  // label content is computed once here and reused for both measurement and
  // rendering below, rather than invoking `formatMarkerLabel` twice per mark.
  const markerLabelContents: JSXOutput[] = markerLabels
    ? marks.map((mark) => formatMarkerLabel?.(mark.value) ?? mark.value)
    : [];

  const maxMarkerLabelChars = markerLabelContents.reduce<number>(
    (longest, content) => {
      const length = jsxOutputToText(content).length;
      return length > longest ? length : longest;
    },
    0,
  );

  const valueRatio = ratioOf(displayValue, min, max);
  const innerMinRatio = ratioOf(effectiveInnerMin, min, max);
  const innerMaxRatio = ratioOf(effectiveInnerMax, min, max);

  return (
    <div
      class={[
        styles["elm-slider"],
        isVertical && styles.vertical,
        disabled && styles.disabled,
        // `.marks`/`.mark`/`.mark-label` are `position: absolute` so they
        // can overlay tick positions without disturbing the track's flex
        // layout — but that also means they never contribute to `.track`'s
        // or this element's own box size. Reserve the space explicitly so
        // the tick and label row renders inside the slider's box instead of
        // bleeding past its bottom (or, in vertical orientation, its
        // inline-end) edge.
        markers && styles["has-markers"],
        markerLabels && styles["has-marker-labels"],
        className,
      ]}
      style={
        {
          "--elmethis-scoped-value-ratio": valueRatio,
          "--elmethis-scoped-inner-min-ratio": innerMinRatio,
          "--elmethis-scoped-inner-max-ratio": innerMaxRatio,
          "--elmethis-scoped-max-marker-label-chars": maxMarkerLabelChars,
          ...(style as CSSProperties),
        } as CSSProperties
      }
    >
      <div
        // `rest` (aria-label, id, data-*, tabIndex overrides, ...) belongs on
        // the interactive element itself, not this layout wrapper — this
        // component IS a slider, unlike e.g. ElmAudioPlayer where the root is
        // a larger widget and the `role="slider"` seek bar is just one
        // control in it. Explicit props are set first and `{...rest}` spreads
        // last, so a caller-supplied `tabIndex`/`onKeyDown$`/`onPointerDown$`/
        // `onPointerMove$` fully overrides the internal one — the same
        // convention every other interactive component in this package
        // follows (see elm-checkbox.tsx, elm-switch.tsx).
        tabIndex={disabled ? -1 : 0}
        class={styles.track}
        role="slider"
        aria-orientation={orientation}
        aria-valuemin={effectiveInnerMin}
        aria-valuemax={effectiveInnerMax}
        aria-valuenow={displayValue}
        aria-disabled={disabled || undefined}
        onPointerDown$={(event: PointerEvent, el: HTMLDivElement) => {
          // Reference `props.disabled`/`props.orientation` directly rather
          // than the destructured `disabled`/`isVertical` locals — capturing
          // a destructured boolean prop into this QRL closure trips
          // `qwik/valid-lexical-scope` ("... is Symbol, which is not
          // serializable"), a known false positive; see elm-checkbox.tsx and
          // elm-switch.tsx for the same `props.x` convention.
          if (props.disabled) return;
          el.setPointerCapture(event.pointerId);
          currentValue.value = valueFromPointer(
            event.clientX,
            event.clientY,
            el.getBoundingClientRect(),
            props.orientation === "vertical",
            min,
            max,
            step,
            effectiveInnerMin,
            effectiveInnerMax,
          );
        }}
        onPointerMove$={(event: PointerEvent, el: HTMLDivElement) => {
          if (props.disabled) return;
          if (!el.hasPointerCapture(event.pointerId)) return;
          currentValue.value = valueFromPointer(
            event.clientX,
            event.clientY,
            el.getBoundingClientRect(),
            props.orientation === "vertical",
            min,
            max,
            step,
            effectiveInnerMin,
            effectiveInnerMax,
          );
        }}
        onKeyDown$={(event: KeyboardEvent) => {
          if (props.disabled) return;
          // `step` is a granularity, not a direction — a caller-supplied
          // negative step must not reverse which arrow key increases the
          // value.
          const delta = Math.abs(step);
          // Step relative to `displayValue` (what aria-valuenow actually
          // reports), not the raw `currentValue.value` — a controlling
          // parent may pass a value outside the inner range, and stepping
          // from the raw value would silently re-absorb into the same
          // clamped display value instead of moving by one step.
          switch (event.key) {
            case "ArrowRight":
            case "ArrowUp":
              event.preventDefault();
              currentValue.value = clampToInner(
                displayValue + delta,
                effectiveInnerMin,
                effectiveInnerMax,
              );
              break;
            case "ArrowLeft":
            case "ArrowDown":
              event.preventDefault();
              currentValue.value = clampToInner(
                displayValue - delta,
                effectiveInnerMin,
                effectiveInnerMax,
              );
              break;
            case "PageUp":
              event.preventDefault();
              currentValue.value = clampToInner(
                displayValue + delta * 10,
                effectiveInnerMin,
                effectiveInnerMax,
              );
              break;
            case "PageDown":
              event.preventDefault();
              currentValue.value = clampToInner(
                displayValue - delta * 10,
                effectiveInnerMin,
                effectiveInnerMax,
              );
              break;
            case "Home":
              event.preventDefault();
              currentValue.value = effectiveInnerMin;
              break;
            case "End":
              event.preventDefault();
              currentValue.value = effectiveInnerMax;
              break;
          }
        }}
        {...rest}
      >
        <div class={styles.rail} aria-hidden="true">
          <div class={styles["restricted-start"]} />
          <div class={styles.fill} />
          <div class={styles["restricted-end"]} />
        </div>

        {marks.length > 0 && (
          <div class={styles.marks} aria-hidden="true">
            {marks.map((mark, index) => (
              <span
                key={mark.value}
                class={[
                  styles.mark,
                  // The default transform centers the tick/label on the
                  // marker's position, which pushes the first/last label
                  // half its own width past the track's start/end edge.
                  // Clamp those two to align inward instead of centering.
                  index === 0 && styles["mark-start"],
                  index === marks.length - 1 && styles["mark-end"],
                  (mark.value < effectiveInnerMin ||
                    mark.value > effectiveInnerMax) &&
                    styles["mark-restricted"],
                ]}
                style={{
                  "--elmethis-scoped-marker-ratio": mark.ratio,
                }}
              >
                {markers && <i class={styles.tick} />}
                {markerLabels && (
                  <span class={styles["mark-label"]}>
                    {markerLabelContents[index]}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <span class={styles.thumb} aria-hidden="true" />
      </div>
    </div>
  );
});
