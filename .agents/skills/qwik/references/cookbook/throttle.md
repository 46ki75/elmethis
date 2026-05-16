# Cookbook: Throttle

## What is a throttle?

A throttle limits how often a function can run inside a time window. Useful for
high-frequency events like `mousemove`, `scroll`, `resize`, or rapid input
changes where you want updates to land regularly without overwhelming the work
they trigger.

Two edges matter:

- **Leading edge** — the first call fires immediately.
- **Trailing edge** — if more calls arrive during the cooldown window, the
  last one is delivered when the window expires.

Skipping the trailing edge means the user's most recent value is silently
dropped, which is usually a bug. Implement both unless you have a reason not to.

## Implementation (QRL-returning, mirrors `useDebouncer`)

```tsx
import { $, useSignal, type QRL } from "@builder.io/qwik";

export const useThrottler = <A extends unknown[], R>(
  fn: QRL<(...args: A) => R>,
  interval: number,
): QRL<(...args: A) => void> => {
  // The cooldown timer id and the most recent suppressed args. Both survive
  // task re-runs because they live in component-scoped useSignal storage.
  const timerId = useSignal<number>();
  const pending = useSignal<A | undefined>();

  return $((...args: A): void => {
    if (timerId.value !== undefined) {
      // Mid-cooldown: remember the latest args for the trailing flush.
      pending.value = args;
      return;
    }

    // Leading edge.
    void fn(...args);

    const arm = () => {
      timerId.value = window.setTimeout(() => {
        timerId.value = undefined;
        if (pending.value !== undefined) {
          // Trailing edge: flush most recent args and re-arm.
          const next = pending.value;
          pending.value = undefined;
          void fn(...next);
          arm();
        }
      }, interval);
    };
    arm();
  });
};
```

`window.setTimeout` (rather than the global `setTimeout`) keeps the return
type as `number`, which is serializable. The Qwik optimizer encodes this QRL
as a chunk; nothing inside the closure leaks across the boundary improperly.

> **Note for reviewers / future readers:** `window.setTimeout` returns a
> `number` in real browsers **and** under jsdom (verified directly against
> jsdom 26.x). It is only the bare global `setTimeout` in a Node-only context
> that returns a `NodeJS.Timeout` object. This recipe runs inside a QRL
> invoked from browser event handlers (`onMouseMove$`, `onInput$`, …), so
> `window.setTimeout` + `useSignal<number>` is the correct shape and matches
> `cookbook/debouncer.md`. Don't "fix" this to `noSerialize(setTimeout(...))`
> — that pattern is only required when the timer is armed from a `useTask$`
> body that also runs during SSR (e.g. the signal-pair `useThrottledSignal`
> in elmethis), where the bare `setTimeout` on the server returns a
> non-serializable `Timeout` object.

## Usage

```tsx
import { $, component$, useSignal } from "@builder.io/qwik";
import { useThrottler } from "~/utils/throttler";

export default component$(() => {
  const x = useSignal(0);

  const setX = useThrottler(
    $((value: number) => {
      x.value = value;
    }),
    100,
  );

  return (
    <div onMouseMove$={(e) => setX(e.clientX)}>
      <p>{x.value}</p>
    </div>
  );
});
```

## Why a trailing-edge flush matters

A leading-edge-only throttle keeps a state in step with the _first_ event of
each window and drops everything that follows. For pointer position or scroll
position this means the displayed value freezes the moment the user stops
moving — the final resting position is never written. Always pair leading
with trailing for state-tracking use cases.

## Common pitfalls

### Cleaning up the pending cooldown timer

If you store `timerId` only in a local variable (or in a closure that doesn't
survive resumption), an unmount mid-cooldown leaves an orphan timer that
fires into a disposed component. Keep `timerId` in a `useSignal` and clear it
from an unmount cleanup:

```tsx
useTask$(({ cleanup }) => {
  cleanup(() => {
    if (timerId.value !== undefined) window.clearTimeout(timerId.value);
  });
});
```

This cleanup task takes no `track()` call, so its cleanup fires **only on
unmount** — not on every re-run of any other tracking task. If you instead
register the cleanup inside a tracked `useTask$`, it fires before every
re-run and will repeatedly clear your in-flight cooldown.

### Don't track `signal.value` and write `throttledSignal.value` in the same

### tracked task

If you build a signal-pair API (`{ signal, throttledSignal }`) on top of a
`useTask$` that tracks `signal.value` and writes `throttledSignal.value`
inside a `setTimeout`, see the testing notes in `references/qwik-core.md`
("Testing helper") — Qwik's test platform doesn't auto-flush renders queued
from raw timer callbacks, which makes the behaviour hard to verify in
`createDOM` unless you trigger a follow-up `userEvent`.
