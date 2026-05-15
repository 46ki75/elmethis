import { useSignal, useStore, useTask$ } from "@builder.io/qwik";
// cloneDeep, not structuredClone: Qwik's useStore proxy is not
// structured-cloneable (throws DataCloneError). Deep-cloning is required so
// the two stores don't share nested object references.
import { cloneDeep, isEqual } from "es-toolkit";

// `Object.assign(dst, src)` cannot delete keys that exist on `dst` but not on
// `src`. Stores allow `delete store.foo`, so we strip those stale keys before
// copying — otherwise `debouncedStore` would retain forever-stuck keys after
// the user deletes them from `store`.
const syncStore = <T extends object>(dst: T, src: T): void => {
  for (const key of Object.keys(dst)) {
    if (!(key in src)) delete (dst as Record<string, unknown>)[key];
  }
  Object.assign(dst, src);
};

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
 * SSR caveat: this hook arms a `setTimeout` inside a `useTask$`. On the
 * server the timer never fires before HTML serialization, so any write to
 * `store` that happens *during* SSR (e.g. via a sibling `useTask$`) ships a
 * stuck `isPending: true` and a stale `debouncedStore` to the client. Seed
 * the store from `useStore(initial)` / a `routeLoader$` value at
 * construction instead of writing it from a server task.
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
      syncStore(debouncedStore, snapshot);
      isPending.value = false;
      return;
    }

    if (isEqual(snapshot, debouncedStore)) {
      isPending.value = false;
      return;
    }

    isPending.value = true;

    const id = setTimeout(() => {
      syncStore(debouncedStore, snapshot);
      isPending.value = false;
    }, delay);

    cleanup(() => clearTimeout(id));
  });

  return { store, debouncedStore, isPending };
};
