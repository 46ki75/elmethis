import {
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
  type Setter,
} from "solid-js";

import { createValueSignal, resolveSetterValue } from "./create-value-signal";

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
  const [value, setImmediateValue] = createValueSignal(initialValue);
  const [throttledValue, setThrottledValue] = createValueSignal(initialValue);
  const [isCooling, setIsCooling] = createSignal(false);
  // Timer decisions follow writes even if Solid has not committed them yet.
  let latestValue = initialValue;
  let publishedValue = initialValue;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const publish = (nextValue: T) => {
    setThrottledValue(() => nextValue);
    publishedValue = nextValue;
  };

  const armCooldown = () => {
    setIsCooling(true);
    timer = setTimeout(
      () => {
        timer = undefined;
        if (disposed) {
          return;
        }

        if (!Object.is(latestValue, publishedValue)) {
          publish(latestValue);
          armCooldown();
        } else {
          setIsCooling(false);
        }
      },
      Math.max(0, interval),
    );
  };

  const setValue = ((nextValue: unknown) => {
    const resolvedValue = setImmediateValue((previous) =>
      untrack(() => resolveSetterValue(nextValue, previous)),
    );
    if (Object.is(resolvedValue, latestValue)) {
      return resolvedValue;
    }

    latestValue = resolvedValue;
    if (interval <= 0) {
      publish(resolvedValue);
    } else if (timer === undefined) {
      publish(resolvedValue);
      armCooldown();
    }

    return resolvedValue;
  }) as Setter<T>;

  onCleanup(() => {
    disposed = true;
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  });

  return { value, setValue, throttledValue, isCooling };
}
