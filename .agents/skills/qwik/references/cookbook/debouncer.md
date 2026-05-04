# Cookbook: Debouncer

> Source: `packages/docs/src/routes/docs/cookbook/debouncer/index.mdx`

## What is a debouncer?

A debouncer delays executing a function until a specified time has elapsed since the last invocation. Useful for search inputs, resize handlers, and validation.

## Implementation

```tsx
import { $, useSignal, type QRL } from '@builder.io/qwik';

export const useDebouncer = <A extends unknown[], R>(
  fn: QRL<(...args: A) => R>,
  delay: number,
): QRL<(...args: A) => void> => {
  const timeoutId = useSignal<number>();

  return $((...args: A): void => {
    window.clearTimeout(timeoutId.value);
    timeoutId.value = window.setTimeout(() => {
      void fn(...args);
    }, delay);
  });
};
```

`useSignal` tracks the timeout ID so it survives serialization (resumability-safe).

## Usage

```tsx
import { $, component$, useSignal } from '@builder.io/qwik';
import { useDebouncer } from '~/utils/debouncer';

export default component$(() => {
  const debouncedValue = useSignal('');

  const debounce = useDebouncer(
    $((value: string) => { debouncedValue.value = value; }),
    1000,
  );

  return (
    <>
      <input onInput$={(_, t) => debounce(t.value)} />
      <p>{debouncedValue.value}</p>
    </>
  );
});
```

## Bonus: `useDebouncer$` (auto-wrapping variant)

Use `implicit$FirstArg` to avoid explicitly wrapping the callback with `$()`:

```tsx
import { implicit$FirstArg } from '@builder.io/qwik';

export const useDebouncerQrl = <A extends unknown[], R>(
  fn: QRL<(...args: A) => R>,
  delay: number,
): QRL<(...args: A) => void> => {
  const timeoutId = useSignal<number>();
  return $((...args: A) => {
    window.clearTimeout(timeoutId.value);
    timeoutId.value = window.setTimeout(() => void fn(...args), delay);
  });
};

export const useDebouncer$ = implicit$FirstArg(useDebouncerQrl);
```

Now users call it without the extra `$()`:

```tsx
const debounce = useDebouncer$((value: string) => { ... }, 1000);
```
