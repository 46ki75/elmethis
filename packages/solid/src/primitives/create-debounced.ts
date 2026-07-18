import {
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
  type Setter,
} from "solid-js";

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
  const [value, setImmediateValue] = createSignal(initialValue, {
    equals: Object.is,
  });
  const [debouncedValue, setDebouncedValue] = createSignal(initialValue, {
    equals: Object.is,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
  };

  const setValue = ((nextValue: unknown) =>
    untrack(() => {
      const currentValue = value();
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previous: T) => T)(currentValue)
          : (nextValue as T);

      if (Object.is(resolvedValue, currentValue)) return resolvedValue;

      setImmediateValue(() => resolvedValue);
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
    })) as Setter<T>;

  const isPending: Accessor<boolean> = () =>
    !Object.is(value(), debouncedValue());

  onCleanup(clearTimer);

  return { value, setValue, debouncedValue, isPending };
}
