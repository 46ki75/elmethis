import { useVModel } from "@vueuse/core";
import type { Ref, UnwrapRef } from "vue";

/**
 * Optionally-bindable single-value state — the Vue port of qwik's
 * `useBindableSignal` / react's `useControllableState` wrapper.
 *
 * Built on Vue's `v-model` contract: a model prop (`key`) plus its
 * `update:<key>` event. `defineModel` would generate the same contract, but it
 * is a `<script setup>` compiler macro and is unavailable in our
 * `defineComponent` + TSX authoring style — so we wire the contract by hand and
 * wrap it with `useVModel` here.
 *
 * - **Bound:** the parent binds `v-model:<key>` (passes the prop + listens to
 *   `update:<key>`). The hook returns a ref that reads through to the prop and
 *   writes by emitting, so the parent stays the source of truth.
 * - **Unbound:** the parent omits the prop (it must default to `undefined` so
 *   "unbound" is distinguishable from a real `false`/`""`/`0`). The hook owns
 *   internal state seeded with `defaultValue`.
 *
 * Returns a writable `Ref<T>`; read/write via `.value`, mirroring qwik's
 * `Signal<T>`. For multi-field / nested-struct state, prefer a store-shaped
 * equivalent rather than this single-value hook.
 *
 * @example
 *   // props: { checked: { type: Boolean, default: undefined }, ... }
 *   // emits: ["update:checked"]
 *   const isChecked = useBindableSignal({
 *     props,
 *     key: "checked",
 *     emit,
 *     defaultValue: props.defaultChecked ?? false,
 *   });
 *   // Read `isChecked.value`; write with `isChecked.value = next`.
 */
export function useBindableSignal<P extends object, K extends keyof P>(args: {
  /** The component's reactive `props` object. */
  props: P;
  /** The model prop name (e.g. `"checked"`). Must default to `undefined`. */
  key: K;
  /** The component's `emit`; the hook fires `update:<key>` through it. */
  emit: (event: `update:${string & K}`, ...payload: unknown[]) => void;
  /** Initial value for the internal state when unbound. */
  defaultValue: NonNullable<P[K]>;
}): Ref<UnwrapRef<P[K]>> {
  const { props, key, emit, defaultValue } = args;
  return useVModel(props, key, emit, { passive: true, defaultValue });
}
