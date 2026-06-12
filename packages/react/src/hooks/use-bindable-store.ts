import * as React from "react";
import { useControllableState } from "@radix-ui/react-use-controllable-state";

/**
 * Optionally-bindable struct state.
 *
 * - **Bound (controlled):** parent passes their own `value`. The hook returns
 *   that same value, and every write is forwarded to `onChange` so the parent
 *   stays the single source of truth.
 * - **Unbound (uncontrolled):** parent omits `value`. The hook owns an
 *   internal state seeded with `defaultValue`.
 *
 * Use this when the controllable state is a struct (form values, multi-field
 * UI state). For a single primitive value, prefer `useBindableSignal`.
 *
 * React-idiom note: Qwik's twin returns the mutable `Proxy<T>` from `useStore`,
 * so callers mutate nested properties in place (`form.name = "Alice"`). React
 * has no such reactive proxy, so this port returns the
 * `[value, setValue]` tuple from `@radix-ui/react-use-controllable-state`
 * instead. To update a field, set a fresh object:
 * `setValue((prev) => ({ ...prev, name: "Alice" }))`.
 *
 * Aliasing footgun: passing a module-scope object as `defaultValue` will share
 * its nested references across every component instance. Pass a fresh object
 * literal at the call site (or `structuredClone` a shared seed) so updates do
 * not leak between instances.
 *
 * @example
 *   const [form, setForm] = useBindableStore({
 *     value: props.form,
 *     defaultValue: { name: "", age: 0 },
 *     onChange: props.onFormChange,
 *   });
 *   // setForm((prev) => ({ ...prev, name: "Alice" }));
 *   // setForm((prev) => ({ ...prev, age: prev.age + 1 }));
 */
export function useBindableStore<T extends object>({
  value,
  defaultValue,
  onChange,
}: {
  /** Parent-owned value. When omitted, the hook falls back to internal state. */
  value?: T;
  /** Initial value for the internal state when unbound. */
  defaultValue: T;
  /** Called with the next value on every write (required for the bound case). */
  onChange?: (value: T) => void;
}): [T, React.Dispatch<React.SetStateAction<T>>] {
  return useControllableState<T>({
    prop: value,
    defaultProp: defaultValue,
    onChange,
    caller: "useBindableStore",
  });
}
