import {
  noSerialize,
  useSignal,
  useStore,
  useTask$,
  type NoSerialize,
} from "@builder.io/qwik";
// cloneDeep, not structuredClone: Qwik's useStore proxy is not
// structured-cloneable (throws DataCloneError). Deep-cloning is required so
// the two stores don't share nested object references.
import { cloneDeep, isEqual } from "es-toolkit";

/**
 * Returns a store pair with leading + trailing edge throttled reactivity.
 *
 * `store` is a deep-reactive proxy that reflects every write immediately.
 * `throttledStore` receives the same state on the *leading edge* of each
 * throttle window: the first write within any `interval` ms window fires at
 * once. Further writes within the same window are suppressed, but the most
 * recent suppressed snapshot is delivered on the *trailing edge* when the
 * window expires, and a fresh window starts.
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
  const store = useStore<T>(cloneDeep(initialValue));
  const throttledStore = useStore<T>(cloneDeep(initialValue));
  const isCooling = useSignal(false);
  // noSerialize because bare setTimeout returns a non-serializable Timeout
  // object on the server (only the browser returns a number).
  const cooldownId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  // Unmount-only cleanup: clears any pending cooldown timer. Kept in its own
  // task so the cleanup does not fire on every re-run of the tracking task,
  // which would clobber an in-flight cooldown.
  useTask$(({ cleanup }) => {
    cleanup(() => {
      if (cooldownId.value !== undefined) clearTimeout(cooldownId.value);
    });
  });

  useTask$(({ track }) => {
    const snapshot = track(() => cloneDeep(store));

    if (interval <= 0) {
      Object.assign(throttledStore, snapshot);
      return;
    }

    const arm = () => {
      isCooling.value = true;
      cooldownId.value = noSerialize(
        setTimeout(() => {
          cooldownId.value = undefined;
          isCooling.value = false;
          const latest = cloneDeep(store);
          if (!isEqual(latest, throttledStore)) {
            Object.assign(throttledStore, latest);
            arm();
          }
        }, interval),
      );
    };

    if (cooldownId.value === undefined) {
      if (isEqual(snapshot, throttledStore)) return;
      Object.assign(throttledStore, snapshot);
      arm();
    }
    // else: write suppressed; trailing-edge fire will pick it up.
  });

  return { store, throttledStore, isCooling };
};
