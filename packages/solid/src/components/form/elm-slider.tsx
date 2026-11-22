import {
  createEffect,
  createMemo,
  createSignal,
  For,
  omit,
  onSettled,
  Show,
  type Accessor,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { mergeStyle } from "../../styles/merge-style";
import styles from "./elm-slider.module.css";

export type ElmSliderOrientation = "horizontal" | "vertical";

export interface ElmSliderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  tabIndex?: number | string;
  /** Lower bound of the track's full range. @defaultValue 0 */
  min?: number;
  /** Upper bound of the track's full range. @defaultValue 100 */
  max?: number;
  /** Increment used for pointer snapping and keyboard movement. @defaultValue 1 */
  step?: number;
  /** Lowest reachable value inside the full track range. @defaultValue min */
  innerMin?: number;
  /** Highest reachable value inside the full track range. @defaultValue max */
  innerMax?: number;
  /** Track direction. @defaultValue "horizontal" */
  orientation?: ElmSliderOrientation;
  /** Controlled value. When provided, the parent owns the value. */
  value?: number;
  /** Initial uncontrolled value. @defaultValue midpoint of the inner range */
  defaultValue?: number;
  /** Called with the next value whenever it changes. */
  onValueChange?: (value: number) => void;
  /** Disables pointer and keyboard interaction. */
  disabled?: boolean;
  /** Draws a tick mark at every rendered step. */
  markers?: boolean;
  /** Draws a label at every rendered step. */
  markerLabels?: boolean;
  /** Formats marker label content. @defaultValue String(value) */
  formatMarkerLabel?: (value: number) => JSX.Element;
}

interface Mark {
  value: number;
  ratio: number;
}

interface ResolvedMark extends Mark {
  label: Accessor<JSX.Element | undefined>;
}

const MAX_MARKERS = 500;

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

const preciseRound = (value: number) =>
  Math.round(value * 1_000_000_000) / 1_000_000_000;

const roundAndClamp = (value: number, low: number, high: number) =>
  clamp(preciseRound(value), low, high);

const primitiveTextLength = (value: unknown): number => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).length;
  }
  if (Array.isArray(value)) {
    return value.reduce(
      (length: number, item: unknown) => length + primitiveTextLength(item),
      0,
    );
  }
  return 0;
};

const buildMarks = (
  enabled: boolean,
  min: number,
  max: number,
  step: number,
): Mark[] => {
  if (!enabled || max === min) {
    return [];
  }

  const magnitude = Math.abs(step);
  if (magnitude === 0) {
    return [];
  }

  const signedStep = max > min ? magnitude : -magnitude;
  const realCount = Math.floor(preciseRound(Math.abs(max - min) / magnitude));
  const marks: Mark[] = [];

  if (realCount <= MAX_MARKERS) {
    for (let index = 0; index <= realCount; index++) {
      const value = preciseRound(min + index * signedStep);
      marks.push({
        value,
        ratio: max === min ? 0 : clamp((value - min) / (max - min), 0, 1),
      });
    }

    if (preciseRound(min + realCount * signedStep) !== preciseRound(max)) {
      marks.push({ value: max, ratio: 1 });
    }
  } else {
    const sampledStep = (max - min) / MAX_MARKERS;
    for (let index = 0; index <= MAX_MARKERS; index++) {
      const value =
        index === MAX_MARKERS ? max : preciseRound(min + index * sampledStep);
      marks.push({ value, ratio: index / MAX_MARKERS });
    }
  }

  return marks;
};

export const ElmSlider = (props: ElmSliderProps) => {
  const rest = omit(
    props,
    "ref",
    "class",
    "style",
    "children",
    "tabIndex",
    "tabindex",
    "onKeyDown",
    "onPointerDown",
    "onPointerMove",
    "onPointerUp",
    "onPointerCancel",
    "onLostPointerCapture",
    "min",
    "max",
    "step",
    "innerMin",
    "innerMax",
    "orientation",
    "value",
    "defaultValue",
    "onValueChange",
    "disabled",
    "markers",
    "markerLabels",
    "formatMarkerLabel",
  );
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;
  const orientation = () => props.orientation ?? "horizontal";
  const rangeLow = createMemo(() => Math.min(min(), max()));
  const rangeHigh = createMemo(() => Math.max(min(), max()));
  const effectiveInnerMin = createMemo(() =>
    clamp(props.innerMin ?? rangeLow(), rangeLow(), rangeHigh()),
  );
  const effectiveInnerMax = createMemo(() =>
    clamp(props.innerMax ?? rangeHigh(), effectiveInnerMin(), rangeHigh()),
  );
  const clampValue = (value: number) =>
    roundAndClamp(value, effectiveInnerMin(), effectiveInnerMax());
  const snapValue = (value: number) => {
    const magnitude = Math.abs(step());
    const snapped =
      magnitude === 0
        ? value
        : min() + Math.round((value - min()) / magnitude) * magnitude;
    return clampValue(snapped);
  };
  const ratioOf = (value: number) =>
    max() === min() ? 0 : clamp((value - min()) / (max() - min()), 0, 1);

  const [currentValue, setCurrentValue] = createControllableSignal<number>({
    value: () => props.value,
    defaultValue: () =>
      clampValue(
        props.defaultValue ?? (effectiveInnerMin() + effectiveInnerMax()) / 2,
      ),
    onChange: (value) => props.onValueChange?.(value),
  });
  const displayValue = createMemo(() => clampValue(currentValue()));
  const valueRatio = createMemo(() => ratioOf(displayValue()));
  const numericInnerMinRatio = createMemo(() => ratioOf(effectiveInnerMin()));
  const numericInnerMaxRatio = createMemo(() => ratioOf(effectiveInnerMax()));
  const innerStartRatio = createMemo(() =>
    Math.min(numericInnerMinRatio(), numericInnerMaxRatio()),
  );
  const innerEndRatio = createMemo(() =>
    Math.max(numericInnerMinRatio(), numericInnerMaxRatio()),
  );
  const fillStartRatio = createMemo(() =>
    Math.min(valueRatio(), numericInnerMinRatio()),
  );
  const fillSizeRatio = createMemo(() =>
    Math.abs(valueRatio() - numericInnerMinRatio()),
  );

  const marksEnabled = createMemo(() =>
    Boolean(props.markers || props.markerLabels),
  );
  const marks = createMemo(() =>
    buildMarks(marksEnabled(), min(), max(), step()),
  );
  const resolvedMarks = createMemo<ResolvedMark[]>(() => {
    return marks().map((mark) => {
      const label = createMemo(() => {
        if (!props.markerLabels) {
          return undefined;
        }
        const label = props.formatMarkerLabel?.(mark.value) ?? mark.value;
        return typeof label === "number" ? String(label) : label;
      });
      return { ...mark, label };
    });
  });
  const maxMarkerLabelChars = createMemo(() =>
    resolvedMarks().reduce(
      (longest, mark) => Math.max(longest, primitiveTextLength(mark.label())),
      0,
    ),
  );

  const [maxMarkerLabelWidth, setMaxMarkerLabelWidth] = createSignal(0);
  let track: HTMLDivElement | undefined;
  let capturedPointerId: number | undefined;

  createEffect(
    () => (props.markerLabels ? resolvedMarks() : undefined),
    (marks) => {
      const labels =
        marks &&
        track?.querySelectorAll<HTMLElement>(`.${styles["mark-label"]}`);
      const measure = () => {
        let width = 0;
        for (const label of labels ?? []) {
          width = Math.max(width, label.getBoundingClientRect().width);
        }
        setMaxMarkerLabelWidth(Math.ceil(width));
      };
      measure();
      if (labels?.length && typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(measure);
        for (const label of labels) {
          observer.observe(label);
        }
        return () => observer.disconnect();
      }
      return undefined;
    },
  );

  const releasePointer = (pointerId = capturedPointerId) => {
    if (pointerId === undefined || pointerId !== capturedPointerId) {
      return;
    }
    if (track?.hasPointerCapture(pointerId)) {
      track.releasePointerCapture(pointerId);
    }
    if (capturedPointerId === pointerId) {
      capturedPointerId = undefined;
    }
  };

  onSettled(() => releasePointer);

  createEffect(
    () => props.disabled,
    (disabled) => {
      if (disabled) {
        releasePointer();
      }
    },
  );

  const valueFromPointer = (clientX: number, clientY: number) => {
    if (track == null) {
      return displayValue();
    }
    const rect = track.getBoundingClientRect();
    const ratio =
      orientation() === "vertical"
        ? rect.height === 0
          ? 0
          : clamp((rect.bottom - clientY) / rect.height, 0, 1)
        : rect.width === 0
          ? 0
          : clamp((clientX - rect.left) / rect.width, 0, 1);
    return snapValue(min() + ratio * (max() - min()));
  };

  const handlePointerDown: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (props.disabled) {
      return;
    }
    if (
      capturedPointerId !== undefined &&
      capturedPointerId !== event.pointerId
    ) {
      releasePointer();
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    capturedPointerId = event.pointerId;
    setCurrentValue(valueFromPointer(event.clientX, event.clientY));
    callEventHandler(props.onPointerDown, event);
  };

  const handlePointerMove: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (props.disabled) {
      return;
    }
    if (
      capturedPointerId !== event.pointerId ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      callEventHandler(props.onPointerMove, event);
      return;
    }
    setCurrentValue(valueFromPointer(event.clientX, event.clientY));
    callEventHandler(props.onPointerMove, event);
  };

  const handlePointerUp: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (props.disabled) {
      return;
    }
    releasePointer(event.pointerId);
    callEventHandler(props.onPointerUp, event);
  };

  const handlePointerCancel: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (props.disabled) {
      return;
    }
    releasePointer(event.pointerId);
    callEventHandler(props.onPointerCancel, event);
  };

  const handleLostPointerCapture: JSX.EventHandler<
    HTMLDivElement,
    PointerEvent
  > = (event) => {
    if (capturedPointerId === event.pointerId) {
      capturedPointerId = undefined;
    }
    if (!props.disabled) {
      callEventHandler(props.onLostPointerCapture, event);
    }
  };

  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (
    event,
  ) => {
    if (props.disabled) {
      return;
    }
    const delta = Math.abs(step());
    const low = effectiveInnerMin();
    const high = effectiveInnerMax();
    const moveBy = (distance: number) => {
      setCurrentValue((current) =>
        roundAndClamp(roundAndClamp(current, low, high) + distance, low, high),
      );
    };

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        moveBy(delta);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        moveBy(-delta);
        break;
      case "PageUp":
        event.preventDefault();
        moveBy(delta * 10);
        break;
      case "PageDown":
        event.preventDefault();
        moveBy(-delta * 10);
        break;
      case "Home":
        event.preventDefault();
        setCurrentValue(low);
        break;
      case "End":
        event.preventDefault();
        setCurrentValue(high);
        break;
    }

    callEventHandler(props.onKeyDown, event);
  };

  return (
    <div
      class={clsx(
        styles["elm-slider"],
        orientation() === "vertical" && styles.vertical,
        props.disabled && styles.disabled,
        props.markers && styles["has-markers"],
        props.markerLabels && styles["has-marker-labels"],
        props.class,
      )}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-value-ratio": valueRatio(),
        "--elmethis-scoped-inner-min-ratio": innerStartRatio(),
        "--elmethis-scoped-inner-max-ratio": innerEndRatio(),
        "--elmethis-scoped-fill-start-ratio": fillStartRatio(),
        "--elmethis-scoped-fill-size-ratio": fillSizeRatio(),
        "--elmethis-scoped-max-marker-label-chars": maxMarkerLabelChars(),
        "--elmethis-scoped-max-marker-label-width": `${maxMarkerLabelWidth()}px`,
      })}
    >
      <div
        {...rest}
        tabindex={props.tabindex ?? props.tabIndex ?? (props.disabled ? -1 : 0)}
        ref={[
          (element) => {
            track = element;
          },
          props.ref,
        ]}
        class={styles.track}
        role="slider"
        aria-orientation={orientation()}
        aria-valuemin={effectiveInnerMin()}
        aria-valuemax={effectiveInnerMax()}
        aria-valuenow={displayValue()}
        aria-disabled={props.disabled ? "true" : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handleLostPointerCapture}
        onKeyDown={handleKeyDown}
      >
        <div class={styles.rail} aria-hidden="true">
          <div class={styles["restricted-start"]} />
          <div class={styles.fill} />
          <div class={styles["restricted-end"]} />
        </div>

        <Show when={resolvedMarks().length > 0}>
          <div class={styles.marks} aria-hidden="true">
            <For each={resolvedMarks()}>
              {(mark, index) => (
                <span
                  class={clsx(
                    styles.mark,
                    index() === 0 && styles["mark-start"],
                    index() === resolvedMarks().length - 1 &&
                      styles["mark-end"],
                    (mark.value < effectiveInnerMin() ||
                      mark.value > effectiveInnerMax()) &&
                      styles["mark-restricted"],
                  )}
                  style={{ "--elmethis-scoped-marker-ratio": mark.ratio }}
                >
                  <Show when={props.markers}>
                    <i class={styles.tick} />
                  </Show>
                  <Show when={props.markerLabels}>
                    <span class={styles["mark-label"]}>{mark.label()}</span>
                  </Show>
                </span>
              )}
            </For>
          </div>
        </Show>

        <span class={styles.thumb} aria-hidden="true" />
      </div>
    </div>
  );
};
