import { createSignal, onCleanup, type Accessor } from "solid-js";

export interface CreateDelayedSignalReturn<T> {
  value: Accessor<T>;
  delayedValue: Accessor<T>;
  isValueChanging: Accessor<boolean>;
  dispatch: (value: T, delay?: number) => void;
}

/** Creates an eagerly updated value with an imperatively delayed companion. */
export function createDelayedSignal<T>(
  initialValue: T,
): CreateDelayedSignalReturn<T> {
  const [value, setValue] = createSignal(initialValue, { equals: Object.is });
  const [delayedValue, setDelayedValue] = createSignal(initialValue, {
    equals: Object.is,
  });
  const [isValueChanging, setIsValueChanging] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
  };

  const dispatch = (nextValue: T, delay = 0) => {
    clearTimer();
    setValue(() => nextValue);

    if (delay <= 0) {
      setDelayedValue(() => nextValue);
      setIsValueChanging(false);
      return;
    }

    setIsValueChanging(true);
    timer = setTimeout(() => {
      timer = undefined;
      setDelayedValue(() => nextValue);
      setIsValueChanging(false);
    }, delay);
  };

  onCleanup(clearTimer);

  return { value, delayedValue, isValueChanging, dispatch };
}
