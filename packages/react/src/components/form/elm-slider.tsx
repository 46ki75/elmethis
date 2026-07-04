import {
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { clsx } from "clsx";

import { useBindableSignal } from "../../hooks/use-bindable-signal";
import styles from "./elm-slider.module.css";

export type ElmSliderOrientation = "horizontal" | "vertical";

export interface ElmSliderProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> {
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
   * Controlled value. When provided the parent owns the value.
   */
  value?: number;

  /**
   * Initial value when uncontrolled.
   *
   * @defaultValue the midpoint of `innerMin`/`innerMax`
   */
  defaultValue?: number;

  /**
   * Called with the next value whenever it changes.
   */
  onValueChange?: (value: number) => void;

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
   * Formats the text shown for a marker label.
   *
   * @defaultValue String(value)
   */
  formatMarkerLabel?: (value: number) => ReactNode;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

// Rounds away float dust (e.g. 0 + 3 * 0.1 -> 0.30000000000000004).
const preciseRound = (n: number) => Math.round(n * 1e9) / 1e9;

// Guards against generating an unbounded number of DOM nodes if a caller
// pairs a tiny `step` with a wide `[min, max]`.
const MAX_MARKERS = 500;

// `formatMarkerLabel` is typed to return an arbitrary `ReactNode` (elements,
// fragments, arrays, ...), not just a string/number — so measuring its length
// can't rely on `typeof`. Recursively concatenate the actual rendered text
// (an element's text length is its children's, not its own) so a
// JSX-returning formatter is measured by what it actually renders, not by a
// `String(mark.value)` fallback that ignores the formatter entirely.
const reactNodeToText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToText).join("");
  if (isValidElement(node)) {
    return reactNodeToText((node.props as { children?: ReactNode }).children);
  }
  // Fragments/iterables/portals and anything else we can't statically
  // measure — better to under-report nothing extra than to throw.
  return "";
};

export const ElmSlider = ({
  className,
  style,
  min = 0,
  max = 100,
  step = 1,
  innerMin,
  innerMax,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  disabled,
  markers,
  markerLabels,
  formatMarkerLabel,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  ...rest
}: ElmSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
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

  const snap = useCallback(
    (raw: number) => {
      // `step` is a granularity, not a direction — mirror the keyboard
      // handler's `Math.abs(step)` so a negative step still quantizes
      // (only `step === 0` means "no snapping").
      const magnitude = Math.abs(step);
      const stepped =
        magnitude > 0
          ? min + Math.round((raw - min) / magnitude) * magnitude
          : raw;
      return clamp(preciseRound(stepped), effectiveInnerMin, effectiveInnerMax);
    },
    [min, step, effectiveInnerMin, effectiveInnerMax],
  );

  // Unlike `snap`, this does NOT re-quantize onto a grid anchored at `min` —
  // it clamps a value that has already moved by exactly `delta` from the
  // current value. Used for keyboard stepping, where the current value may
  // legitimately be off-grid (a persisted preference, or an inner bound that
  // doesn't itself sit on the step grid) and a single key press must change
  // the value by exactly one step, not snap it onto the nearest grid line.
  const clampValue = useCallback(
    (raw: number) =>
      clamp(preciseRound(raw), effectiveInnerMin, effectiveInnerMax),
    [effectiveInnerMin, effectiveInnerMax],
  );

  const [currentValue, setCurrentValue] = useBindableSignal<number>({
    value,
    // Unlike pointer/keyboard-driven moves, the initial seed is not something
    // the user is actively snapping onto a grid — it's either a caller's
    // explicit, possibly-off-grid `defaultValue` (e.g. a persisted
    // preference) or the documented midpoint default. Both must be honored
    // verbatim, exactly like a controlled `value` is preserved off-grid
    // elsewhere in this file — so only clamp into range here, don't `snap()`.
    defaultValue: clampValue(
      defaultValue ?? (effectiveInnerMin + effectiveInnerMax) / 2,
    ),
    onChange: onValueChange,
  });

  const ratioOf = useCallback(
    (v: number) => (max === min ? 0 : clamp((v - min) / (max - min), 0, 1)),
    [min, max],
  );

  const valueFromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      const el = trackRef.current;
      if (!el) return currentValue;
      const rect = el.getBoundingClientRect();
      const ratio = isVertical
        ? rect.height === 0
          ? 0
          : clamp((rect.bottom - clientY) / rect.height, 0, 1)
        : rect.width === 0
          ? 0
          : clamp((clientX - rect.left) / rect.width, 0, 1);
      return snap(min + ratio * (max - min));
    },
    [currentValue, isVertical, max, min, snap],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setCurrentValue(valueFromPointer(event.clientX, event.clientY));
    },
    [disabled, setCurrentValue, valueFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      setCurrentValue(valueFromPointer(event.clientX, event.clientY));
    },
    [disabled, setCurrentValue, valueFromPointer],
  );

  // A controlling parent owns `currentValue` and may pass one outside the
  // inner range (e.g. set before `innerMin`/`innerMax` were added) — clamp
  // only for display so `aria-valuenow` and the thumb never report/render
  // outside the declared bounds, without calling `onValueChange` ourselves.
  const displayValue = clamp(
    currentValue,
    effectiveInnerMin,
    effectiveInnerMax,
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      // `step` is a granularity, not a direction — a caller-supplied negative
      // step must not reverse which arrow key increases the value.
      const delta = Math.abs(step);
      // Step relative to `displayValue` (what aria-valuenow actually
      // reports), not the raw `currentValue` — a controlling parent may pass
      // a value outside the inner range, and stepping from the raw value
      // would silently re-absorb into the same clamped display value instead
      // of moving by one step.
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          setCurrentValue(clampValue(displayValue + delta));
          break;
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          setCurrentValue(clampValue(displayValue - delta));
          break;
        case "PageUp":
          event.preventDefault();
          setCurrentValue(clampValue(displayValue + delta * 10));
          break;
        case "PageDown":
          event.preventDefault();
          setCurrentValue(clampValue(displayValue - delta * 10));
          break;
        case "Home":
          event.preventDefault();
          setCurrentValue(effectiveInnerMin);
          break;
        case "End":
          event.preventDefault();
          setCurrentValue(effectiveInnerMax);
          break;
      }
    },
    [
      disabled,
      displayValue,
      effectiveInnerMin,
      effectiveInnerMax,
      setCurrentValue,
      clampValue,
      step,
    ],
  );

  const marks = useMemo(() => {
    if (!markers && !markerLabels) return [];
    // `step` is a granularity, not a direction — mirror `snap()` and the
    // keyboard handler's `Math.abs(step)` so a negative step still renders
    // ticks (only `step === 0` or an empty range means "no ticks").
    const magnitude = Math.abs(step);
    if (magnitude <= 0 || max <= min) return [];
    // `preciseRound` absorbs float dust in (max-min)/step (e.g.
    // 0.3/0.1 -> 2.9999999999999996, which must count as 3) without
    // rounding a genuine fraction up to the next integer (e.g.
    // 10/6 -> 1.6666666666666667 must floor to 1, not round up to 2 and
    // generate a tick beyond `max`).
    const realCount = Math.floor(preciseRound((max - min) / magnitude));
    const out: { value: number; ratio: number }[] = [];
    if (realCount <= MAX_MARKERS) {
      // Tick every real step — these are exactly the values `snap()` can
      // ever produce — then force a trailing tick at `max` if `step`
      // doesn't divide `max - min` evenly.
      for (let i = 0; i <= realCount; i++) {
        const v = preciseRound(min + i * magnitude);
        out.push({ value: v, ratio: ratioOf(v) });
      }
      if (preciseRound(min + realCount * magnitude) !== preciseRound(max)) {
        out.push({ value: max, ratio: ratioOf(max) });
      }
    } else {
      // Past MAX_MARKERS, evenly resample across the full range instead of
      // rendering only the first MAX_MARKERS real step-ticks — otherwise a
      // tiny step over a wide range clusters every rendered tick near
      // `min`. These resampled ticks are cosmetic only (not all of them are
      // reachable by `snap()`), which is an acceptable trade-off once there
      // are too many real ticks to render individually.
      const tickStep = (max - min) / MAX_MARKERS;
      for (let i = 0; i <= MAX_MARKERS; i++) {
        const v = i === MAX_MARKERS ? max : preciseRound(min + i * tickStep);
        out.push({ value: v, ratio: ratioOf(v) });
      }
    }
    return out;
  }, [markers, markerLabels, step, min, max, ratioOf]);

  // `.vertical.has-marker-labels` reserves `padding-right` to fit the
  // tick, the gap, and the label itself — but the label's *width* scales
  // with its character count (unlike the horizontal orientation, where the
  // reserved `padding-block-end` only ever needs a label's roughly-constant
  // line-height). Measure the longest rendered label so the CSS can size the
  // reservation to it via `ch` (exact for `.mark-label`'s monospace font)
  // instead of a fixed constant that only fits short labels.
  const maxMarkerLabelChars = useMemo(() => {
    if (!markerLabels) return 0;
    let max = 0;
    for (const mark of marks) {
      const rendered = formatMarkerLabel?.(mark.value) ?? mark.value;
      const text = reactNodeToText(rendered);
      if (text.length > max) max = text.length;
    }
    return max;
  }, [markerLabels, marks, formatMarkerLabel]);

  const valueRatio = ratioOf(displayValue);
  const innerMinRatio = ratioOf(effectiveInnerMin);
  const innerMaxRatio = ratioOf(effectiveInnerMax);

  return (
    <div
      className={clsx(
        styles["elm-slider"],
        isVertical && styles.vertical,
        disabled && styles.disabled,
        // `.marks`/`.mark`/`.mark-label` are `position: absolute` so they can
        // overlay tick positions without disturbing the track's flex layout
        // — but that also means they never contribute to `.track`'s or this
        // element's own box size. Reserve the space explicitly so the tick
        // and label row renders inside the slider's box instead of bleeding
        // past its bottom (or, in vertical orientation, its inline-end) edge.
        markers && styles["has-markers"],
        markerLabels && styles["has-marker-labels"],
        className,
      )}
      style={
        {
          "--elmethis-scoped-value-ratio": valueRatio,
          "--elmethis-scoped-inner-min-ratio": innerMinRatio,
          "--elmethis-scoped-inner-max-ratio": innerMaxRatio,
          "--elmethis-scoped-max-marker-label-chars": maxMarkerLabelChars,
          ...style,
        } as CSSProperties
      }
    >
      <div
        // `rest` (aria-label, id, data-*, ...) belongs on the interactive
        // element itself, not this layout wrapper — this component IS a
        // slider, unlike e.g. ElmAudioPlayer where the root is a larger
        // widget and the `role="slider"` seek bar is just one control in it.
        tabIndex={disabled ? -1 : 0}
        {...rest}
        ref={trackRef}
        className={styles.track}
        role="slider"
        aria-orientation={orientation}
        aria-valuemin={effectiveInnerMin}
        aria-valuemax={effectiveInnerMax}
        aria-valuenow={displayValue}
        aria-disabled={disabled || undefined}
        onPointerDown={(event) => {
          handlePointerDown(event);
          if (disabled) return;
          onPointerDown?.(event);
        }}
        onPointerMove={(event) => {
          handlePointerMove(event);
          if (disabled) return;
          onPointerMove?.(event);
        }}
        onKeyDown={(event) => {
          handleKeyDown(event);
          if (disabled) return;
          onKeyDown?.(event);
        }}
      >
        <div className={styles.rail} aria-hidden="true">
          <div className={styles["restricted-start"]} />
          <div className={styles.fill} />
          <div className={styles["restricted-end"]} />
        </div>

        {marks.length > 0 && (
          <div className={styles.marks} aria-hidden="true">
            {marks.map((mark, index) => (
              <span
                key={mark.value}
                className={clsx(
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
                )}
                style={
                  {
                    "--elmethis-scoped-marker-ratio": mark.ratio,
                  } as CSSProperties
                }
              >
                {markers && <i className={styles.tick} />}
                {markerLabels && (
                  <span className={styles["mark-label"]}>
                    {formatMarkerLabel?.(mark.value) ?? mark.value}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <span className={styles.thumb} aria-hidden="true" />
      </div>
    </div>
  );
};
