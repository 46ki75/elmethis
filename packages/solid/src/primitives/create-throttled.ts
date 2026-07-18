import {
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
  type Setter,
} from "solid-js";

export interface CreateThrottledReturn<T> {
  value: Accessor<T>;
  setValue: Setter<T>;
  throttledValue: Accessor<T>;
  isCooling: Accessor<boolean>;
}

/** Creates writable state with a leading-and-trailing throttled view. */
export function createThrottled<T>(
  initialValue: T,
  interval: number,
): CreateThrottledReturn<T> {
  const [value, setImmediateValue] = createSignal(initialValue, {
    equals: Object.is,
  });
  const [throttledValue, setThrottledValue] = createSignal(initialValue, {
    equals: Object.is,
  });
  const [isCooling, setIsCooling] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const armCooldown = () => {
    setIsCooling(true);
    timer = setTimeout(
      () => {
        timer = undefined;
        if (disposed) return;

        const latestValue = untrack(value);
        if (!Object.is(latestValue, untrack(throttledValue))) {
          setThrottledValue(() => latestValue);
          armCooldown();
        } else {
          setIsCooling(false);
        }
      },
      Math.max(0, interval),
    );
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

      if (interval <= 0) {
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
        setThrottledValue(() => resolvedValue);
        setIsCooling(false);
      } else if (timer === undefined) {
        setThrottledValue(() => resolvedValue);
        armCooldown();
      }

      return resolvedValue;
    })) as Setter<T>;

  onCleanup(() => {
    disposed = true;
    if (timer !== undefined) clearTimeout(timer);
  });

  return { value, setValue, throttledValue, isCooling };
}
