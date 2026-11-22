import {
  createMemo,
  untrack,
  type Accessor,
  type Setter,
  type Signal,
} from "solid-js";

import { createValueSignal, resolveSetterValue } from "./create-value-signal";

export interface CreateControllableSignalOptions<T> {
  /** The parent-owned value. Returning `undefined` enables uncontrolled mode. */
  value?: Accessor<T | undefined>;

  /** Creates the initial value used in uncontrolled mode. */
  defaultValue: Accessor<T>;

  /** Called when a write requests a value different from the current effective value. */
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
  const [internalValue, setInternalValue] = createValueSignal(
    untrack(() => options.defaultValue()),
  );
  const value = createMemo<T>(
    () => {
      const controlledValue = options.value?.();
      return controlledValue === undefined ? internalValue() : controlledValue;
    },
    { equals: Object.is },
  );

  const setValue = ((nextValue: unknown) =>
    untrack(() => {
      // A controlled request does not become current until the parent commits it.
      const controlledValue = options.value?.();
      let changed = false;
      const resolve = (previous: T) => {
        const next = resolveSetterValue(nextValue, previous);
        changed = !Object.is(next, previous);
        return next;
      };
      const resolvedValue =
        controlledValue === undefined
          ? setInternalValue(resolve)
          : resolve(controlledValue);

      if (changed) {
        options.onChange?.(resolvedValue);
      }
      return resolvedValue;
    })) as Setter<T>;

  return [value, setValue];
}
