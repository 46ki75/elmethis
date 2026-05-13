import { useSignal, useStore, useTask$ } from "@builder.io/qwik";

const shallowEqual = <T extends object>(a: T, b: T): boolean => {
  const keys = Object.keys(a) as (keyof T)[];
  return (
    keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k])
  );
};

/**
 * Returns a store pair with leading-edge throttled reactivity.
 *
 * `store` is a deep-reactive proxy that reflects every write immediately.
 * `throttledStore` receives the same state on the *leading edge* of each
 * throttle window: the first write within any `interval` ms window fires at
 * once; subsequent writes within the same window are suppressed. Once the
 * window expires the next write fires immediately again.
 *
 * `isCooling` is `true` while the throttle cooldown window is active.
 *
 * When `interval` is 0 or negative, `throttledStore` is updated
 * synchronously alongside `store` (no throttling).
 *
 * @param initialValue - The initial value for both stores.
 * @param interval - Throttle interval in milliseconds.
 *
 * @example
 * ```tsx
 * const { store, throttledStore, isCooling } = useThrottledStore({ x: 0, y: 0 }, 100);
 *
 * // store.x / store.y update on every mousemove
 * // throttledStore updates at most once every 100 ms
 * <div onMouseMove$={(e) => { store.x = e.clientX; store.y = e.clientY; }} />
 * ```
 */
export const useThrottledStore = <T extends object>(
  initialValue: T,
  interval: number,
) => {
  const store = useStore<T>({ ...initialValue });
  const throttledStore = useStore<T>({ ...initialValue });
  // Not passed to track() — read as a plain gate, not a reactive dependency.
  const isCooling = useSignal(false);

  useTask$(({ track }) => {
    const snapshot = track(() => ({ ...store }));

    if (interval <= 0) {
      Object.assign(throttledStore, snapshot);
      return;
    }

    // Skip the initial run when both stores are in sync and no cooldown is active.
    if (shallowEqual(snapshot, throttledStore) && !isCooling.value) {
      return;
    }

    // Leading edge: fire only if the cooldown window is not active.
    if (!isCooling.value) {
      Object.assign(throttledStore, snapshot);
      isCooling.value = true;
      setTimeout(() => {
        isCooling.value = false;
      }, interval);
    }
    // else: suppressed within the cooldown window
  });

  return { store, throttledStore, isCooling };
};
