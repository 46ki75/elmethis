import { useSignal, type Signal } from "@qwik.dev/core";

/**
 * Optionally-bindable signal state.
 *
 * - **Bound:** parent passes their own `Signal<T>`. The hook returns that
 *   same signal — writes from the component go straight to the parent's
 *   signal, and writes from the parent are observed by the component.
 * - **Unbound:** parent omits the signal. The hook returns an
 *   internally-owned signal seeded with `defaultValue`.
 *
 * Use this when the controllable state is a single value. For multi-field /
 * nested-struct state, prefer `useBindableStore`.
 *
 * Note: the internal fallback signal is allocated and serialized for
 * resumption even when the parent supplies their own (hook rules require an
 * unconditional `useSignal` call). The cost is small but non-zero.
 *
 * @example
 *   const checked = useBindableSignal({
 *     signal: props.checked,
 *     defaultValue: props.defaultChecked ?? false,
 *   });
 *   // Use `checked.value` like any signal.
 */
export function useBindableSignal<T>({
  signal,
  defaultValue,
}: {
  /** Parent-owned signal. When omitted, the hook falls back to an internal one. */
  signal?: Signal<T>;
  /** Initial value for the internal signal when unbound. */
  defaultValue: T;
}): Signal<T> {
  // Always call useSignal so hook rules are obeyed; the internal signal is
  // unused (but still serialized) when the parent supplied their own.
  const internal = useSignal<T>(defaultValue);
  return signal ?? internal;
}
