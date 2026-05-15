import { useSignal, useStore, useTask$ } from "@builder.io/qwik";
import { cloneDeep, isEqual } from "es-toolkit";

/**
 * Returns a store pair with debounced reactivity.
 *
 * `store` is a deep-reactive proxy that reflects every write immediately.
 * `debouncedStore` receives the same state only after `delay` ms have elapsed
 * since the last write to `store`. Rapid successive writes reset the timer so
 * only the final state propagates to `debouncedStore`.
 *
 * `isPending` is `true` while the debounce timer is active.
 *
 * When `delay` is 0 or negative, `debouncedStore` is updated synchronously.
 *
 * @param initialValue - The initial value for both stores.
 * @param delay - Debounce delay in milliseconds.
 *
 * @example
 * ```tsx
 * const { store, debouncedStore, isPending } = useDebouncedStore({ query: "" }, 500);
 *
 * // store.query updates on every keystroke
 * // debouncedStore.query updates 500 ms after the user stops typing
 * <input onInput$={(_, t) => (store.query = t.value)} />
 * ```
 */
export const useDebouncedStore = <T extends object>(
  initialValue: T,
  delay: number,
) => {
  const store = useStore<T>(cloneDeep(initialValue));
  const debouncedStore = useStore<T>(cloneDeep(initialValue));
  const isPending = useSignal(false);

  useTask$(({ track, cleanup }) => {
    const snapshot = track(() => cloneDeep(store));

    if (delay <= 0) {
      Object.assign(debouncedStore, snapshot);
      isPending.value = false;
      return;
    }

    if (isEqual(snapshot, debouncedStore)) {
      isPending.value = false;
      return;
    }

    isPending.value = true;

    const id = setTimeout(() => {
      Object.assign(debouncedStore, snapshot);
      isPending.value = false;
    }, delay);

    cleanup(() => clearTimeout(id));
  });

  return { store, debouncedStore, isPending };
};
