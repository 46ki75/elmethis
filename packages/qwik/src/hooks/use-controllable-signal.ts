import { useSignal, type Signal } from "@qwik.dev/core";

/**
 * Signal-flavored controllable state.
 *
 * - **Controlled:** parent passes their own `Signal<T>`. The hook returns
 *   that same signal — writes from the component go straight to the parent,
 *   and writes from the parent are observed by the component.
 * - **Uncontrolled:** parent omits the signal. The hook returns an
 *   internally-owned signal seeded with `defaultValue`.
 *
 * Compared to `useControllableState`, this hook:
 *   - returns a writable `Signal<T>` instead of `[readonly signal, setter QRL]`
 *   - skips the `onChange$` QRL — the parent observes writes by reading
 *     their own signal's `.value`
 *   - does NOT support "controlled-with-plain-value" semantics; the parent
 *     must own a writable signal
 *
 * Use this when the parent should own the state directly and there is
 * nothing for the component to intercept on writes. For interception,
 * validation, or plain-value props, use `useControllableState`.
 *
 * @example
 *   // Component
 *   const checked = useControllableSignal({
 *     signal: props.checked,
 *     defaultValue: props.defaultChecked ?? false,
 *   });
 *   // Use `checked.value` like any signal.
 */
export function useControllableSignal<T>({
  signal,
  defaultValue,
}: {
  /** Parent-owned signal. When omitted, the hook falls back to an internal one. */
  signal?: Signal<T>;
  /** Initial value for the internal signal when uncontrolled. */
  defaultValue: T;
}): Signal<T> {
  // Always call useSignal so hook rules are obeyed; the internal signal is
  // unused (but still serialized) when the parent supplied their own.
  const internal = useSignal<T>(defaultValue);
  return signal ?? internal;
}
