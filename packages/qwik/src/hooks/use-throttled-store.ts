import {
  $,
  type NoSerialize,
  noSerialize,
  type QRL,
  useSignal,
  useStore,
} from "@builder.io/qwik";

/**
 * Returns a store pair and a throttled setter.
 *
 * `store` is a deep-reactive proxy that reflects the most recently patched
 * state immediately. `throttledStore` is a separate reactive proxy that
 * receives patches on the *leading edge* of each throttle window: the first
 * call within any `interval` ms window fires at once; subsequent calls
 * within the same window are suppressed. Once the window expires the next
 * call will fire immediately again.
 *
 * When `interval` is 0 or negative, `throttledStore` is updated
 * synchronously alongside `store` (no throttling).
 *
 * @param initialValue - The initial value for both stores.
 * @param interval - Throttle interval in milliseconds.
 *
 * @example
 * ```tsx
 * const { store, throttledStore, set } = useThrottledStore({ x: 0, y: 0 }, 100);
 *
 * // store.x / store.y update on every mousemove
 * // throttledStore updates at most once every 100 ms
 * <div onMouseMove$={(e) => set({ x: e.clientX, y: e.clientY })} />
 * ```
 */
export const useThrottledStore = <T extends object>(
  initialValue: T,
  interval: number,
) => {
  const store = useStore<T>({ ...initialValue });
  const throttledStore = useStore<T>({ ...initialValue });
  const timeoutId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  const set: QRL<(patch: Partial<T>) => void> = $((patch: Partial<T>) => {
    Object.assign(store, patch);

    if (interval <= 0) {
      Object.assign(throttledStore, patch);
      return;
    }

    // Leading edge: only fire if the cooldown window is not active.
    if (timeoutId.value === undefined) {
      Object.assign(throttledStore, patch);
      timeoutId.value = noSerialize(
        setTimeout(() => {
          timeoutId.value = undefined;
        }, interval),
      );
    }
  });

  return { store, throttledStore, set };
};
