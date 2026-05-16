import { useStore } from "@qwik.dev/core";

/**
 * Optionally-bindable store state.
 *
 * - **Bound:** parent passes their own store. The hook returns that same
 *   store — writes from the component (including nested property writes)
 *   land directly on the parent's store, and writes from the parent are
 *   observed by the component.
 * - **Unbound:** parent omits the store. The hook returns an
 *   internally-owned store seeded with `defaultValue`.
 *
 * The returned value is the same `Proxy<T>` Qwik's `useStore` returns, so
 * nested reactivity behaves exactly as it does for a plain `useStore`.
 *
 * Use this when the controllable state is a struct (form values,
 * multi-field UI state). For a single-value signal, prefer
 * `useBindableSignal`.
 *
 * Note: when bound, an internal fallback store is still allocated and
 * serialized for resumption (hook rules require an unconditional `useStore`
 * call). For very large default objects, prefer multiple
 * `useBindableSignal` calls per primitive field if the serialization cost
 * matters.
 *
 * Aliasing footgun: passing a module-scope object as `defaultValue` will
 * share its nested references across every component instance — mutate one
 * and you mutate the others. Pass a fresh object literal at the call site,
 * or wrap a shared seed with `cloneDeep` (`es-toolkit` / `lodash`). The
 * same caveat applies to `useStore`.
 *
 * @example
 *   const form = useBindableStore({
 *     store: props.form,
 *     defaultValue: { name: "", age: 0 },
 *   });
 *   // form.name = "Alice"   // reactive
 *   // form.age += 1         // reactive
 */
export function useBindableStore<T extends object>({
  store,
  defaultValue,
}: {
  /** Parent-owned store. When omitted, the hook falls back to an internal one. */
  store?: T;
  /** Initial value for the internal store when unbound. */
  defaultValue: T;
}): T {
  // Always call useStore so hook rules are obeyed; the internal store is
  // unused (but still serialized) when the parent supplied their own.
  const internal = useStore<T>(defaultValue);
  return store ?? internal;
}
