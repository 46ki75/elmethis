import { createSignal, type Accessor } from "solid-js";

export function createValueSignal<T>(
  initialValue: T,
  equals: (previous: T, next: T) => boolean = Object.is,
): [Accessor<T>, (update: (previous: T) => T) => T] {
  // A function passed directly to createSignal defines a computation in Solid 2.
  // Box literal values and still let Solid pass the latest staged value to updaters.
  const [box, setBox] = createSignal(
    { value: initialValue },
    { equals: (previous, next) => equals(previous.value, next.value) },
  );
  const value: Accessor<T> = () => box().value;
  return [
    value,
    (update) => setBox(({ value }) => ({ value: update(value) })).value,
  ];
}

export function resolveSetterValue<T>(value: unknown, previous: T): T {
  return typeof value === "function"
    ? (value as (previous: T) => T)(previous)
    : (value as T);
}
