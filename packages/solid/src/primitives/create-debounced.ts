import { onCleanup, untrack, type Accessor, type Setter } from "solid-js";

import { createValueSignal, resolveSetterValue } from "./create-value-signal";

export interface CreateDebouncedReturn<T> {
  value: Accessor<T>;
  setValue: Setter<T>;
  debouncedValue: Accessor<T>;
  isPending: Accessor<boolean>;
}

/** Creates writable state and a trailing-edge debounced view of that state. */
export function createDebounced<T>(
  initialValue: T,
  delay: number,
): CreateDebouncedReturn<T> {
  const [value, setImmediateValue] = createValueSignal(initialValue);
  const [debouncedValue, setDebouncedValue] = createValueSignal(initialValue);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timer === undefined) {
      return;
    }
    clearTimeout(timer);
    timer = undefined;
  };

  const setValue = ((nextValue: unknown) => {
    let changed = false;
    const resolvedValue = setImmediateValue((previous) => {
      const next = untrack(() => resolveSetterValue(nextValue, previous));
      changed = !Object.is(next, previous);
      return next;
    });
    if (!changed) {
      return resolvedValue;
    }

    clearTimer();
    if (delay <= 0) {
      setDebouncedValue(() => resolvedValue);
    } else {
      timer = setTimeout(() => {
        timer = undefined;
        setDebouncedValue(() => resolvedValue);
      }, delay);
    }

    return resolvedValue;
  }) as Setter<T>;

  const isPending: Accessor<boolean> = () =>
    !Object.is(value(), debouncedValue());

  onCleanup(clearTimer);

  return { value, setValue, debouncedValue, isPending };
}
