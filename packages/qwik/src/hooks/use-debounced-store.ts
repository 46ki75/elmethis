import {
  $,
  type NoSerialize,
  noSerialize,
  type QRL,
  useSignal,
  useStore,
} from "@builder.io/qwik";

/**
 * Returns a store pair and a debounced setter.
 *
 * `store` is a deep-reactive proxy that reflects the most recently patched
 * state immediately. `debouncedStore` is a separate reactive proxy that
 * receives the same patches only after `delay` ms have elapsed since the last
 * call to `set`. Rapid successive calls reset the timer so only the final patch
 * propagates to `debouncedStore`.
 *
 * When `delay` is 0 or negative, `debouncedStore` is updated
 * synchronously alongside `store` (no timer).
 *
 * @param initialValue - The initial value for both stores.
 * @param delay - Debounce delay in milliseconds.
 *
 * @example
 * ```tsx
 * const { store, debouncedStore, set } = useDebouncedStore({ query: "" }, 500);
 *
 * // store.query updates on every keystroke
 * // debouncedStore.query updates 500 ms after the user stops typing
 * <input onInput$={(_, t) => set({ query: t.value })} />
 * ```
 */
export const useDebouncedStore = <T extends object>(
  initialValue: T,
  delay: number,
) => {
  const store = useStore<T>({ ...initialValue });
  const debouncedStore = useStore<T>({ ...initialValue });
  const timeoutId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  const set: QRL<(patch: Partial<T>) => void> = $((patch: Partial<T>) => {
    Object.assign(store, patch);

    if (timeoutId.value !== undefined) {
      clearTimeout(timeoutId.value);
    }

    if (delay <= 0) {
      Object.assign(debouncedStore, patch);
      timeoutId.value = undefined;
    } else {
      timeoutId.value = noSerialize(
        setTimeout(() => {
          Object.assign(debouncedStore, patch);
          timeoutId.value = undefined;
        }, delay),
      );
    }
  });

  return { store, debouncedStore, set };
};
