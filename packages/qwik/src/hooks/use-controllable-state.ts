import {
  $,
  type QRL,
  type ReadonlySignal,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

export type ControllableStateSetter<T> = QRL<
  (value: T | ((prev: T) => T)) => void
>;

/**
 * Qwik equivalent of @radix-ui/react-use-controllable-state.
 *
 * Supports both controlled (parent manages value via prop + onChange$) and
 * uncontrolled (component manages its own state via defaultProp) modes.
 *
 * The `prop` must be a ReadonlySignal so Qwik can track changes across
 * the $ boundary. Wrap props access with useComputed$ at the call site:
 *
 *   const [value, setValue] = useControllableState({
 *     prop: useComputed$(() => props.value),
 *     defaultProp: '',
 *     onChange: props.onValueChange$,
 *   });
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: {
  /** ReadonlySignal for the controlled value. Yields undefined when uncontrolled. */
  prop: ReadonlySignal<T | undefined>;
  defaultProp: T;
  onChange?: QRL<(value: T) => void>;
}): readonly [ReadonlySignal<T>, ControllableStateSetter<T>] {
  const internalValue = useSignal<T>(prop.value ?? defaultProp);
  // Stored as a signal so the setter QRL can read it without capturing a plain function.
  const isControlled = useSignal(prop.value !== undefined);

  useTask$(({ track }) => {
    const controlled = track(() => prop.value);
    isControlled.value = controlled !== undefined;
    if (controlled !== undefined) {
      internalValue.value = controlled;
    }
  });

  const setValue: ControllableStateSetter<T> = $((next) => {
    const resolved =
      typeof next === "function"
        ? (next as (prev: T) => T)(internalValue.value)
        : next;

    if (!isControlled.value) {
      internalValue.value = resolved;
    }

    onChange?.(resolved);
  });

  return [internalValue as ReadonlySignal<T>, setValue] as const;
}
