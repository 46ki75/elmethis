import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type Accessor,
  type JSX,
} from "solid-js";
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
  if (!enabled || max === min) return [];

  const magnitude = Math.abs(step);
  if (magnitude === 0) return [];

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
  const [local, rest] = splitProps(props, [
    "ref",
    "class",
    "style",
    "children",
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
  ]);
  const min = () => local.min ?? 0;
  const max = () => local.max ?? 100;
  const step = () => local.step ?? 1;
  const orientation = () => local.orientation ?? "horizontal";
  const rangeLow = createMemo(() => Math.min(min(), max()));
  const rangeHigh = createMemo(() => Math.max(min(), max()));
  const effectiveInnerMin = createMemo(() =>
    clamp(local.innerMin ?? rangeLow(), rangeLow(), rangeHigh()),
  );
  const effectiveInnerMax = createMemo(() =>
    clamp(local.innerMax ?? rangeHigh(), effectiveInnerMin(), rangeHigh()),
  );
  const clampValue = (value: number) =>
    clamp(preciseRound(value), effectiveInnerMin(), effectiveInnerMax());
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
    value: () => local.value,
    defaultValue: () =>
      clampValue(
        local.defaultValue ?? (effectiveInnerMin() + effectiveInnerMax()) / 2,
      ),
    onChange: (value) => local.onValueChange?.(value),
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
    Boolean(local.markers || local.markerLabels),
  );
  const marks = createMemo(() =>
    buildMarks(marksEnabled(), min(), max(), step()),
  );
  const resolvedMarks = createMemo<ResolvedMark[]>(() => {
    return marks().map((mark) => {
      const label = createMemo(() => {
        if (!local.markerLabels) return undefined;
        return local.formatMarkerLabel?.(mark.value) ?? mark.value;
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
  const markerLabelElements = new Set<HTMLElement>();
  let labelObserver: ResizeObserver | undefined;
  let track: HTMLDivElement | undefined;
  let capturedPointerId: number | undefined;

  const measureMarkerLabels = () => {
    let width = 0;
    for (const element of markerLabelElements) {
      width = Math.max(width, element.getBoundingClientRect().width);
    }
    setMaxMarkerLabelWidth(Math.ceil(width));
  };

  const registerMarkerLabel = (element: HTMLElement) => {
    markerLabelElements.add(element);
    labelObserver?.observe(element);
    onCleanup(() => {
      markerLabelElements.delete(element);
      labelObserver?.unobserve(element);
      measureMarkerLabels();
    });
  };

  const releasePointer = (pointerId = capturedPointerId) => {
    if (pointerId === undefined || pointerId !== capturedPointerId) return;
    if (track?.hasPointerCapture(pointerId))
      track.releasePointerCapture(pointerId);
    if (capturedPointerId === pointerId) capturedPointerId = undefined;
  };

  onMount(() => {
    labelObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measureMarkerLabels);
    for (const element of markerLabelElements) labelObserver?.observe(element);
    measureMarkerLabels();

    onCleanup(() => {
      releasePointer();
      labelObserver?.disconnect();
      labelObserver = undefined;
      markerLabelElements.clear();
    });
  });

  createEffect(() => {
    if (local.disabled) releasePointer();
  });

  const valueFromPointer = (clientX: number, clientY: number) => {
    if (track == null) return displayValue();
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
    if (local.disabled) return;
    if (
      capturedPointerId !== undefined &&
      capturedPointerId !== event.pointerId
    ) {
      releasePointer();
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    capturedPointerId = event.pointerId;
    setCurrentValue(valueFromPointer(event.clientX, event.clientY));
    callEventHandler(local.onPointerDown, event);
  };

  const handlePointerMove: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (local.disabled) return;
    if (
      capturedPointerId !== event.pointerId ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      callEventHandler(local.onPointerMove, event);
      return;
    }
    setCurrentValue(valueFromPointer(event.clientX, event.clientY));
    callEventHandler(local.onPointerMove, event);
  };

  const handlePointerUp: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (local.disabled) return;
    releasePointer(event.pointerId);
    callEventHandler(local.onPointerUp, event);
  };

  const handlePointerCancel: JSX.EventHandler<HTMLDivElement, PointerEvent> = (
    event,
  ) => {
    if (local.disabled) return;
    releasePointer(event.pointerId);
    callEventHandler(local.onPointerCancel, event);
  };

  const handleLostPointerCapture: JSX.EventHandler<
    HTMLDivElement,
    PointerEvent
  > = (event) => {
    if (capturedPointerId === event.pointerId) capturedPointerId = undefined;
    if (!local.disabled) callEventHandler(local.onLostPointerCapture, event);
  };

  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (
    event,
  ) => {
    if (local.disabled) return;
    const delta = Math.abs(step());

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        setCurrentValue(clampValue(displayValue() + delta));
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        setCurrentValue(clampValue(displayValue() - delta));
        break;
      case "PageUp":
        event.preventDefault();
        setCurrentValue(clampValue(displayValue() + delta * 10));
        break;
      case "PageDown":
        event.preventDefault();
        setCurrentValue(clampValue(displayValue() - delta * 10));
        break;
      case "Home":
        event.preventDefault();
        setCurrentValue(effectiveInnerMin());
        break;
      case "End":
        event.preventDefault();
        setCurrentValue(effectiveInnerMax());
        break;
    }

    callEventHandler(local.onKeyDown, event);
  };

  return (
    <div
      class={clsx(
        styles["elm-slider"],
        orientation() === "vertical" && styles.vertical,
        local.disabled && styles.disabled,
        local.markers && styles["has-markers"],
        local.markerLabels && styles["has-marker-labels"],
        local.class,
      )}
      style={mergeStyle(local.style, {
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
        tabIndex={local.disabled ? -1 : 0}
        {...rest}
        ref={(element) => {
          track = element;
          if (typeof local.ref === "function") local.ref(element);
        }}
        class={styles.track}
        role="slider"
        aria-orientation={orientation()}
        aria-valuemin={effectiveInnerMin()}
        aria-valuemax={effectiveInnerMax()}
        aria-valuenow={displayValue()}
        aria-disabled={local.disabled || undefined}
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
                  <Show when={local.markers}>
                    <i class={styles.tick} />
                  </Show>
                  <Show when={local.markerLabels}>
                    <span
                      ref={registerMarkerLabel}
                      class={styles["mark-label"]}
                    >
                      {mark.label()}
                    </span>
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
