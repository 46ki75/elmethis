import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { Dispatch, SetStateAction } from "react";

/**
 * Optionally-controllable single-value state.
 *
 * The React API returns a `[value, setValue]` tuple and supports controlled and
 * uncontrolled state:
 *
 * - **Controlled:** parent passes their own `value`. The hook returns that
 *   value — calling `setValue` invokes the parent's `onChange` so the parent
 *   stays the source of truth.
 * - **Uncontrolled:** parent omits `value`. The hook owns internal state
 *   seeded with `defaultValue`.
 *
 * Use this when the controllable state is a single value. For multi-field /
 * nested-struct state, prefer `useBindableStore`.
 *
 * @example
 *   const [checked, setChecked] = useBindableSignal({
 *     value: props.checked,
 *     defaultValue: props.defaultChecked ?? false,
 *     onChange: props.onCheckedChange,
 *   });
 *   // Read `checked`; write with `setChecked(next)`.
 */
export function useBindableSignal<T>({
  value,
  defaultValue,
  onChange,
}: {
  /** Parent-owned value. When omitted, the hook falls back to internal state. */
  value?: T;
  /** Initial value for the internal state when uncontrolled. */
  defaultValue: T;
  /** Invoked whenever the value changes (so a controlling parent can react). */
  onChange?: (value: T) => void;
}): [T, Dispatch<SetStateAction<T>>] {
  return useControllableState<T>({
    prop: value,
    defaultProp: defaultValue,
    onChange,
    caller: "useBindableSignal",
  });
}
