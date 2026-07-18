import {
  createMemo,
  createSignal,
  untrack,
  type Accessor,
  type Setter,
  type Signal,
} from "solid-js";

export interface CreateControllableSignalOptions<T> {
  /** The parent-owned value. Returning `undefined` enables uncontrolled mode. */
  value?: Accessor<T | undefined>;

  /** Creates the initial value used in uncontrolled mode. */
  defaultValue: Accessor<T>;

  /** Called when a write changes the current effective value. */
  onChange?: (value: T) => void;
}

/**
 * Creates state that can be parent-controlled or internally managed.
 *
 * Only `undefined` selects uncontrolled mode, so falsy values such as `false`,
 * `0`, `""`, and `null` remain valid controlled values.
 */
export function createControllableSignal<T>(
  options: CreateControllableSignalOptions<T>,
): Signal<T> {
  const defaultValue = options.defaultValue();
  const [internalValue, setInternalValue] = createSignal(defaultValue, {
    equals: Object.is,
  });
  const value = createMemo<T>(
    () => {
      const controlledValue = options.value?.();
      return controlledValue === undefined ? internalValue() : controlledValue;
    },
    defaultValue,
    { equals: Object.is },
  );

  const setValue = ((nextValue: unknown) =>
    untrack(() => {
      const currentValue = value();
      const resolvedValue: T =
        typeof nextValue === "function"
          ? (nextValue as (previous: T) => T)(currentValue)
          : (nextValue as T);

      if (Object.is(resolvedValue, currentValue)) return resolvedValue;

      if (options.value?.() === undefined) {
        setInternalValue((() => resolvedValue) as (previous: T) => T);
      }

      options.onChange?.(resolvedValue);
      return resolvedValue;
    })) as Setter<T>;

  return [value, setValue];
}
