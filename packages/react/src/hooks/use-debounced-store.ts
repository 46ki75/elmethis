import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
// cloneDeep + isEqual mirror the qwik twin: every value is deep-cloned so the
// immediate and debounced copies never share nested references, and isEqual is
// used to skip the debounce timer when a write produces a new object reference
// with identical contents.
import { cloneDeep, isEqual } from "es-toolkit";

/**
 * Returns a store pair with debounced reactivity.
 *
 * React port of qwik's `useDebouncedStore`. Qwik's signal/store model does not
 * exist in React, so where qwik returned a deep-reactive proxy pair plus an
 * `isPending` signal, this hook returns plain React state:
 *
 * - `store` — the current value, reflecting every write immediately.
 * - `setStore` — the setter for `store` (accepts a value or an updater fn,
 *   exactly like a `useState` setter). Use it where qwik mutated the proxy
 *   in place (e.g. `setStore((s) => ({ ...s, query: next }))`).
 * - `debouncedStore` — receives the same state only after `delay` ms have
 *   elapsed since the last write to `store`. Rapid successive writes reset the
 *   timer so only the final state propagates.
 * - `isPending` — `true` while the debounce timer is active (a write to
 *   `store` has not yet propagated to `debouncedStore`).
 *
 * When `delay` is 0 or negative, `debouncedStore` tracks `store` synchronously.
 *
 * @param initialValue - The initial value for both stores.
 * @param delay - Debounce delay in milliseconds.
 *
 * @example
 *   const { store, setStore, debouncedStore, isPending } = useDebouncedStore(
 *     { query: "" },
 *     500,
 *   );
 *
 *   // store.query updates on every keystroke
 *   // debouncedStore.query updates 500 ms after the user stops typing
 *   <input onInput={(e) => setStore((s) => ({ ...s, query: e.currentTarget.value }))} />
 */
export function useDebouncedStore<T extends object>(
  initialValue: T,
  delay: number,
): {
  store: T;
  setStore: Dispatch<SetStateAction<T>>;
  debouncedStore: T;
  isPending: boolean;
} {
  // Deep-clone the caller's object for both copies so neither the immediate nor
  // the debounced store shares a (mutable) reference with `initialValue`. Seeded
  // once at construction (qwik reads `initialValue` only inside `useStore`), so
  // later `initialValue` identity changes are deliberately ignored.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const seed = useMemo(() => cloneDeep(initialValue), []);

  const [store, setStore] = useState<T>(seed);
  // The timer-backed copy; only the debounce timeout writes to it (delay > 0).
  const [debounced, setDebounced] = useState<T>(() => cloneDeep(seed));

  // When `delay <= 0`, `debouncedStore` tracks `store` synchronously — derived
  // during render so no synchronous setState (and no cascading effect) is
  // needed. Otherwise it is the timer-backed copy.
  const debouncedStore = delay <= 0 ? store : debounced;

  useEffect(() => {
    // delay <= 0 is handled by the derived value above — nothing to schedule.
    if (delay <= 0) return;

    const snapshot = cloneDeep(store);
    const id = setTimeout(() => {
      setDebounced((prev) => (isEqual(snapshot, prev) ? prev : snapshot));
    }, delay);

    return () => clearTimeout(id);
  }, [store, delay]);

  const isPending = !isEqual(store, debouncedStore);

  return { store, setStore, debouncedStore, isPending };
}
