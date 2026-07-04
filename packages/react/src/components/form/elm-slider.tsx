import {
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
  ...rest
}: ElmSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === "vertical";

  const effectiveInnerMin = clamp(innerMin ?? min, min, max);
  const effectiveInnerMax = clamp(innerMax ?? max, effectiveInnerMin, max);

  const snap = useCallback(
    (raw: number) => {
      const stepped =
        step > 0 ? min + Math.round((raw - min) / step) * step : raw;
      return clamp(preciseRound(stepped), effectiveInnerMin, effectiveInnerMax);
    },
    [min, step, effectiveInnerMin, effectiveInnerMax],
  );

  const [currentValue, setCurrentValue] = useBindableSignal<number>({
    value,
    defaultValue: snap(
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

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      // `step` is a granularity, not a direction — a caller-supplied negative
      // step must not reverse which arrow key increases the value.
      const delta = Math.abs(step);
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          setCurrentValue((prev) => snap(prev + delta));
          break;
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          setCurrentValue((prev) => snap(prev - delta));
          break;
        case "PageUp":
          event.preventDefault();
          setCurrentValue((prev) => snap(prev + delta * 10));
          break;
        case "PageDown":
          event.preventDefault();
          setCurrentValue((prev) => snap(prev - delta * 10));
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
      effectiveInnerMin,
      effectiveInnerMax,
      setCurrentValue,
      snap,
      step,
    ],
  );

  const marks = useMemo(() => {
    if (!markers && !markerLabels) return [];
    if (step <= 0 || max <= min) return [];
    // `Math.round` (not `Math.floor`) absorbs float dust in (max-min)/step
    // (e.g. 0.3/0.1 -> 2.9999999999999996, which must count as 3).
    const realCount = Math.round((max - min) / step);
    // Past MAX_MARKERS, evenly resample across the full range instead of
    // rendering only the first MAX_MARKERS real step-ticks — otherwise a tiny
    // step over a wide range clusters every rendered tick near `min`.
    const count = Math.min(realCount, MAX_MARKERS);
    const tickStep = (max - min) / count;
    const out: { value: number; ratio: number }[] = [];
    for (let i = 0; i <= count; i++) {
      const v = i === count ? max : preciseRound(min + i * tickStep);
      out.push({ value: v, ratio: ratioOf(v) });
    }
    return out;
  }, [markers, markerLabels, step, min, max, ratioOf]);

  // A controlling parent owns `currentValue` and may pass one outside the
  // inner range (e.g. set before `innerMin`/`innerMax` were added) — clamp
  // only for display so `aria-valuenow` and the thumb never report/render
  // outside the declared bounds, without calling `onValueChange` ourselves.
  const displayValue = clamp(
    currentValue,
    effectiveInnerMin,
    effectiveInnerMax,
  );
  const valueRatio = ratioOf(displayValue);
  const innerMinRatio = ratioOf(effectiveInnerMin);
  const innerMaxRatio = ratioOf(effectiveInnerMax);

  return (
    <div
      className={clsx(
        styles["elm-slider"],
        isVertical && styles.vertical,
        disabled && styles.disabled,
        className,
      )}
      style={
        {
          "--elmethis-scoped-value-ratio": valueRatio,
          "--elmethis-scoped-inner-min-ratio": innerMinRatio,
          "--elmethis-scoped-inner-max-ratio": innerMaxRatio,
          ...style,
        } as CSSProperties
      }
    >
      <div
        // `rest` (aria-label, id, data-*, ...) belongs on the interactive
        // element itself, not this layout wrapper — this component IS a
        // slider, unlike e.g. ElmAudioPlayer where the root is a larger
        // widget and the `role="slider"` seek bar is just one control in it.
        {...rest}
        ref={trackRef}
        className={styles.track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-orientation={orientation}
        aria-valuemin={effectiveInnerMin}
        aria-valuemax={effectiveInnerMax}
        aria-valuenow={displayValue}
        aria-disabled={disabled || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.rail} aria-hidden="true">
          <div className={styles["restricted-start"]} />
          <div className={styles.fill} />
          <div className={styles["restricted-end"]} />
        </div>

        {marks.length > 0 && (
          <div className={styles.marks} aria-hidden="true">
            {marks.map((mark) => (
              <span
                key={mark.value}
                className={clsx(
                  styles.mark,
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
