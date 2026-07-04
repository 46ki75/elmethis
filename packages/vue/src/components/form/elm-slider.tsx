import {
  computed,
  defineComponent,
  isVNode,
  ref,
  type CSSProperties,
  type HTMLAttributes,
  type PropType,
  type VNodeChild,
} from "vue";
import { clsx } from "clsx";

import { useBindableSignal } from "../../hooks/use-bindable-signal";
import styles from "./elm-slider.module.css";

export type ElmSliderOrientation = "horizontal" | "vertical";

export interface ElmSliderProps extends Omit<HTMLAttributes, "onChange"> {
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
   * Controlled value. Bind with `v-model:value`; when provided the parent
   * owns the value (prop `value` + `update:value` event).
   */
  value?: number;

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
   * Formats the text shown for a marker label.
   *
   * @defaultValue String(value)
   */
  formatMarkerLabel?: (value: number) => VNodeChild;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

// Rounds away float dust (e.g. 0 + 3 * 0.1 -> 0.30000000000000004).
const preciseRound = (n: number) => Math.round(n * 1e9) / 1e9;

// Guards against generating an unbounded number of DOM nodes if a caller
// pairs a tiny `step` with a wide `[min, max]`.
const MAX_MARKERS = 500;

// `formatMarkerLabel` is typed to return an arbitrary `VNodeChild` (vnodes,
// arrays, primitives, ...), not just a string/number — so measuring its
// length can't rely on `typeof`. Recursively concatenate the actual rendered
// text (a vnode's text length is its children's, not its own) so a
// JSX-returning formatter is measured by what it actually renders, not by a
// `String(mark.value)` fallback that ignores the formatter entirely.
const nodeToText = (node: unknown): string => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isVNode(node)) return nodeToText(node.children);
  // Fragments/slots/anything else we can't statically measure — better to
  // under-report nothing extra than to throw.
  return "";
};

export const ElmSlider = defineComponent({
  name: "ElmSlider",
  // `rest` (aria-label, id, data-*, tabindex overrides, ...) belongs on the
  // interactive element itself (the `role="slider"` track), not the outer
  // wrapper — the wrapper only exists to carry the CSS custom properties.
  // This component IS a slider, unlike e.g. ElmAudioPlayer where the root is
  // a larger widget and the seek bar is just one control in it. `class`/
  // `style` are the one exception: like the React port, they're pulled out
  // of `attrs` and applied to the outer wrapper instead of `rest`'s default
  // destination.
  inheritAttrs: false,
  props: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    innerMin: { type: Number, default: undefined },
    innerMax: { type: Number, default: undefined },
    orientation: {
      type: String as PropType<ElmSliderOrientation>,
      default: "horizontal",
    },
    // Must default to `undefined` so an unbound slider is distinguishable
    // from one explicitly bound to `0` (see `useBindableSignal`).
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: undefined },
    disabled: { type: Boolean, default: undefined },
    markers: { type: Boolean, default: undefined },
    markerLabels: { type: Boolean, default: undefined },
    formatMarkerLabel: {
      type: Function as PropType<(value: number) => VNodeChild>,
      default: undefined,
    },
  },
  emits: ["update:value"],
  setup(props, { attrs, emit }) {
    const trackRef = ref<HTMLDivElement | null>(null);
    const isVertical = computed(() => props.orientation === "vertical");

    // `clamp` assumes `lo <= hi`. `min`/`max` alone can't be passed straight
    // through as `[lo, hi]` because a reversed range (`min > max`, a
    // legitimate declining track — see `ratioOf`, which already handles it
    // via plain interpolation) would silently force both inner bounds down
    // to `max` instead of clamping into the declared range. Sort once so the
    // inner bounds are always resolved against the *logical* [low, high]
    // regardless of which of `min`/`max` is numerically larger. The
    // *default* for an omitted innerMin/innerMax must default to this same
    // logical [low, high] span too (not the raw `min`/`max`) — otherwise,
    // for a reversed range, the default innerMax (raw `max`, the smaller
    // number) sits below `rangeLow`/the default innerMin and gets clamped
    // *up* to it instead of down to the range's actual high end, collapsing
    // the whole track to a single point.
    const rangeLow = computed(() => Math.min(props.min, props.max));
    const rangeHigh = computed(() => Math.max(props.min, props.max));
    const effectiveInnerMin = computed(() =>
      clamp(props.innerMin ?? rangeLow.value, rangeLow.value, rangeHigh.value),
    );
    const effectiveInnerMax = computed(() =>
      clamp(
        props.innerMax ?? rangeHigh.value,
        effectiveInnerMin.value,
        rangeHigh.value,
      ),
    );

    const snap = (raw: number): number => {
      // `step` is a granularity, not a direction — mirror the keyboard
      // handler's `Math.abs(step)` so a negative step still quantizes (only
      // `step === 0` means "no snapping").
      const magnitude = Math.abs(props.step);
      const stepped =
        magnitude > 0
          ? props.min + Math.round((raw - props.min) / magnitude) * magnitude
          : raw;
      return clamp(
        preciseRound(stepped),
        effectiveInnerMin.value,
        effectiveInnerMax.value,
      );
    };

    // Unlike `snap`, this does NOT re-quantize onto a grid anchored at
    // `min` — it clamps a value that has already moved by exactly `delta`
    // from the current value. Used for keyboard stepping, where the current
    // value may legitimately be off-grid (a persisted preference, or an
    // inner bound that doesn't itself sit on the step grid) and a single key
    // press must change the value by exactly one step, not snap it onto the
    // nearest grid line.
    const clampValue = (raw: number): number =>
      clamp(
        preciseRound(raw),
        effectiveInnerMin.value,
        effectiveInnerMax.value,
      );

    // Unlike pointer/keyboard-driven moves, the initial seed is not something
    // the user is actively snapping onto a grid — it's either a caller's
    // explicit, possibly-off-grid `defaultValue` (e.g. a persisted
    // preference) or the documented midpoint default. Both must be honored
    // verbatim, exactly like a controlled `value` is preserved off-grid
    // elsewhere in this file — so only clamp into range here, don't `snap()`.
    const currentValue = useBindableSignal({
      props,
      key: "value",
      emit,
      defaultValue: clampValue(
        props.defaultValue ??
          (effectiveInnerMin.value + effectiveInnerMax.value) / 2,
      ),
    });

    const ratioOf = (v: number): number =>
      props.max === props.min
        ? 0
        : clamp((v - props.min) / (props.max - props.min), 0, 1);

    const valueFromPointer = (clientX: number, clientY: number): number => {
      const el = trackRef.value;
      if (!el) return currentValue.value;
      const rect = el.getBoundingClientRect();
      const ratio = isVertical.value
        ? rect.height === 0
          ? 0
          : clamp((rect.bottom - clientY) / rect.height, 0, 1)
        : rect.width === 0
          ? 0
          : clamp((clientX - rect.left) / rect.width, 0, 1);
      return snap(props.min + ratio * (props.max - props.min));
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (props.disabled) return;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      currentValue.value = valueFromPointer(event.clientX, event.clientY);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (props.disabled) return;
      if (
        !(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)
      ) {
        return;
      }
      currentValue.value = valueFromPointer(event.clientX, event.clientY);
    };

    // A controlling parent owns `currentValue` and may pass one outside the
    // inner range (e.g. set before `innerMin`/`innerMax` were added) — clamp
    // only for display so `aria-valuenow` and the thumb never report/render
    // outside the declared bounds, without emitting `update:value` ourselves.
    const displayValue = computed(() =>
      clamp(
        currentValue.value,
        effectiveInnerMin.value,
        effectiveInnerMax.value,
      ),
    );

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (props.disabled) return;
      // `step` is a granularity, not a direction — a caller-supplied
      // negative step must not reverse which arrow key increases the value.
      const delta = Math.abs(props.step);
      // Step relative to `displayValue` (what aria-valuenow actually
      // reports), not the raw `currentValue` — a controlling parent may
      // pass a value outside the inner range, and stepping from the raw
      // value would silently re-absorb into the same clamped display value
      // instead of moving by one step.
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          event.preventDefault();
          currentValue.value = clampValue(displayValue.value + delta);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          event.preventDefault();
          currentValue.value = clampValue(displayValue.value - delta);
          break;
        case "PageUp":
          event.preventDefault();
          currentValue.value = clampValue(displayValue.value + delta * 10);
          break;
        case "PageDown":
          event.preventDefault();
          currentValue.value = clampValue(displayValue.value - delta * 10);
          break;
        case "Home":
          event.preventDefault();
          currentValue.value = effectiveInnerMin.value;
          break;
        case "End":
          event.preventDefault();
          currentValue.value = effectiveInnerMax.value;
          break;
      }
    };

    const marks = computed(() => {
      if (!props.markers && !props.markerLabels) return [];
      // `step` is a granularity, not a direction — mirror `snap()` and the
      // keyboard handler's `Math.abs(step)` so a negative step still renders
      // ticks (only `step === 0` or an empty range means "no ticks").
      const magnitude = Math.abs(props.step);
      if (magnitude <= 0 || props.max <= props.min) return [];
      // `preciseRound` absorbs float dust in (max-min)/step (e.g.
      // 0.3/0.1 -> 2.9999999999999996, which must count as 3) without
      // rounding a genuine fraction up to the next integer (e.g.
      // 10/6 -> 1.6666666666666667 must floor to 1, not round up to 2 and
      // generate a tick beyond `max`).
      const realCount = Math.floor(
        preciseRound((props.max - props.min) / magnitude),
      );
      const out: { value: number; ratio: number }[] = [];
      if (realCount <= MAX_MARKERS) {
        // Tick every real step — these are exactly the values `snap()` can
        // ever produce — then force a trailing tick at `max` if `step`
        // doesn't divide `max - min` evenly.
        for (let i = 0; i <= realCount; i++) {
          const v = preciseRound(props.min + i * magnitude);
          out.push({ value: v, ratio: ratioOf(v) });
        }
        if (
          preciseRound(props.min + realCount * magnitude) !==
          preciseRound(props.max)
        ) {
          out.push({ value: props.max, ratio: ratioOf(props.max) });
        }
      } else {
        // Past MAX_MARKERS, evenly resample across the full range instead of
        // rendering only the first MAX_MARKERS real step-ticks — otherwise a
        // tiny step over a wide range clusters every rendered tick near
        // `min`. These resampled ticks are cosmetic only (not all of them
        // are reachable by `snap()`), which is an acceptable trade-off once
        // there are too many real ticks to render individually.
        const tickStep = (props.max - props.min) / MAX_MARKERS;
        for (let i = 0; i <= MAX_MARKERS; i++) {
          const v =
            i === MAX_MARKERS
              ? props.max
              : preciseRound(props.min + i * tickStep);
          out.push({ value: v, ratio: ratioOf(v) });
        }
      }
      return out;
    });

    // `.vertical.has-marker-labels` reserves `padding-right` to fit the
    // tick, the gap, and the label itself — but the label's *width* scales
    // with its character count (unlike the horizontal orientation, where
    // the reserved `padding-block-end` only ever needs a label's
    // roughly-constant line-height). Measure the longest rendered label so
    // the CSS can size the reservation to it via `ch` (exact for
    // `.mark-label`'s monospace font) instead of a fixed constant that only
    // fits short labels.
    const maxMarkerLabelChars = computed(() => {
      if (!props.markerLabels) return 0;
      let maxChars = 0;
      for (const mark of marks.value) {
        const rendered = props.formatMarkerLabel?.(mark.value) ?? mark.value;
        const text = nodeToText(rendered);
        if (text.length > maxChars) maxChars = text.length;
      }
      return maxChars;
    });

    return () => {
      // `onKeydown` is pulled out of `rest` (rather than left to spread
      // verbatim) so it isn't composed in unconditionally by Vue's
      // `mergeProps` — spreading it alongside the JSX-literal `onKeydown`
      // below would let a caller-supplied handler fire even while
      // `disabled`, bypassing the `if (props.disabled) return` guard that
      // only gates the internal handler. Composing it manually lets
      // `disabled` suppress both, mirroring the React port's contract.
      const {
        class: attrClass,
        style: attrStyle,
        onKeydown: attrsOnKeydown,
        ...rest
      } = attrs as Record<string, unknown>;

      const valueRatio = ratioOf(displayValue.value);
      const innerMinRatio = ratioOf(effectiveInnerMin.value);
      const innerMaxRatio = ratioOf(effectiveInnerMax.value);

      return (
        <div
          class={clsx(
            styles["elm-slider"],
            isVertical.value && styles.vertical,
            props.disabled && styles.disabled,
            // `.marks`/`.mark`/`.mark-label` are `position: absolute` so
            // they can overlay tick positions without disturbing the
            // track's flex layout — but that also means they never
            // contribute to `.track`'s or this element's own box size.
            // Reserve the space explicitly so the tick and label row
            // renders inside the slider's box instead of bleeding past its
            // bottom (or, in vertical orientation, its inline-end) edge.
            props.markers && styles["has-markers"],
            props.markerLabels && styles["has-marker-labels"],
            attrClass as string | undefined,
          )}
          style={
            {
              "--elmethis-scoped-value-ratio": valueRatio,
              "--elmethis-scoped-inner-min-ratio": innerMinRatio,
              "--elmethis-scoped-inner-max-ratio": innerMaxRatio,
              "--elmethis-scoped-max-marker-label-chars":
                maxMarkerLabelChars.value,
              ...(attrStyle as CSSProperties | undefined),
            } as CSSProperties
          }
        >
          <div
            ref={trackRef}
            class={styles.track}
            tabindex={props.disabled ? -1 : 0}
            onPointerdown={handlePointerDown}
            onPointermove={handlePointerMove}
            onKeydown={(event: KeyboardEvent) => {
              handleKeyDown(event);
              if (props.disabled) return;
              (
                attrsOnKeydown as ((event: KeyboardEvent) => void) | undefined
              )?.(event);
            }}
            {...rest}
            // `role`/`aria-*` are written *after* `{...rest}` on purpose:
            // the JSX compiles to `mergeProps({...}, rest)`, and for plain
            // (non-class/style/on*) keys mergeProps lets the later object
            // win. Placing these after `rest` means the slider's own
            // computed ARIA state always wins over a same-named, type-legal
            // attr a caller passes through — mirroring the React port,
            // where these are written after `{...rest}` for the same
            // reason. `tabindex` intentionally stays before `rest` so a
            // caller can still override it (e.g. opt out of tab order).
            role="slider"
            aria-orientation={props.orientation}
            aria-valuemin={effectiveInnerMin.value}
            aria-valuemax={effectiveInnerMax.value}
            aria-valuenow={displayValue.value}
            aria-disabled={props.disabled || undefined}
          >
            <div class={styles.rail} aria-hidden="true">
              <div class={styles["restricted-start"]} />
              <div class={styles.fill} />
              <div class={styles["restricted-end"]} />
            </div>

            {marks.value.length > 0 && (
              <div class={styles.marks} aria-hidden="true">
                {marks.value.map((mark, index) => (
                  <span
                    key={mark.value}
                    class={clsx(
                      styles.mark,
                      // The default transform centers the tick/label on the
                      // marker's position, which pushes the first/last
                      // label half its own width past the track's
                      // start/end edge. Clamp those two to align inward
                      // instead of centering.
                      index === 0 && styles["mark-start"],
                      index === marks.value.length - 1 && styles["mark-end"],
                      (mark.value < effectiveInnerMin.value ||
                        mark.value > effectiveInnerMax.value) &&
                        styles["mark-restricted"],
                    )}
                    style={
                      {
                        "--elmethis-scoped-marker-ratio": mark.ratio,
                      } as CSSProperties
                    }
                  >
                    {props.markers && <i class={styles.tick} />}
                    {props.markerLabels && (
                      <span class={styles["mark-label"]}>
                        {props.formatMarkerLabel?.(mark.value) ?? mark.value}
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
    };
  },
});
