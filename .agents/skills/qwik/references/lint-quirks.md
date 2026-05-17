# `eslint-plugin-qwik` quirks

The Qwik ESLint plugin has a couple of rules whose behavior surprises users.
This file documents the surprising ones, why they fire, and what to do.

---

## `qwik/valid-lexical-scope` — rejects QRL-mixed composites

Booleans built from a `QRL<...>` operand are rejected when captured into a
child `$()` closure. The error message is misleading:

```text
When referencing "hasPicker" inside a different scope ($), Qwik needs to
serialize the value, however it is Symbol, which is not serializable.
```

The cause is the rule's static analysis: it tracks the type flow through
`&&` operands and chokes on the QRL marker even though the runtime result
is plainly `boolean`. Neither `Boolean(...)` coercion nor an explicit
`: boolean` type annotation fixes it — the rule ignores both.

### Example trigger

```tsx
// ❌ Captured into a child $() — rejected
const hasPicker = prompts !== undefined && resolvePrompt$ !== undefined;

const onKey$ = $(() => {
  if (!hasPicker) return;
  /* ... */
});
```

### Workarounds

**Inline the check inside the QRL.** Each individual capture is fine — only
the composite at component scope is problematic:

```tsx
const onKey$ = $(() => {
  if (prompts === undefined || resolvePrompt$ === undefined) return;
  /* ... */
});
```

**Or drop the gate inside the QRL entirely** and rely on downstream
length / null checks. Often viable for event handlers where the per-branch
no-op cases naturally cover the unwired path:

```tsx
const onKey$ = $(() => {
  // list is `[]` when prompts is undefined — every branch already returns
  // early on length === 0, so no explicit "hasPicker" gate is needed.
  const list = filteredPrompts.value;
  if (event.key === "Enter") {
    if (list.length === 0) return;
    /* ... */
  }
});
```

### Why the composite is fine in JSX

```tsx
{hasPicker && <Panel />}                  // ✅ OK in render
<Child isOpen={hasPicker} />              // ✅ OK in render
```

The host component's render is also a `$`-scope, but the rule tolerates
QRL-mixed `&&` results there — only **nested child QRLs** trigger the error.

---

## `qwik/no-async-prevent-default` — pattern-match, not an async check

The rule walks the AST upward from every `event.preventDefault()` call,
looking for a `$(...)` `CallExpression`. If it finds one, it warns —
**regardless of whether the closure body is actually `async`**. The name
is misleading; "no-prevent-default-inside-dollar" would be more accurate.

### Why the rule exists

`$()` closures are extracted into separate lazy-loadable chunks. On the
first invocation, if the chunk hasn't been prefetched, the function runs
on a microtask boundary that's *after* the browser's default-action phase
— so `preventDefault()` has no effect.

In practice, Qwik's prefetcher warms the chunk before the user's first
interaction, so a sync handler with `preventDefault()` usually works.
The rule is conservative to protect the rare cold-start case.

### The correct fix: `sync$()`

Split the listener into a small synchronous part (which can call
`preventDefault`) and an async part (which can touch Qwik state). The sync
part reads decisions from `data-*` attributes that the JSX has already
written:

```tsx
import { component$, sync$, $, useSignal } from "@builder.io/qwik";

export default component$(() => {
  const slashActive = useSignal(false);

  return (
    <textarea
      data-slash-active={slashActive.value ? "1" : "0"}
      onKeyDown$={[
        sync$((e: KeyboardEvent, el: HTMLTextAreaElement) => {
          if (
            el.dataset.slashActive === "1" &&
            ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)
          ) {
            e.preventDefault();
          }
        }),
        $((e: KeyboardEvent, el: HTMLTextAreaElement) => {
          // Normal $() handler — touch signals freely, no preventDefault here
          // ...
        }),
      ]}
    />
  );
});
```

See `cookbook/sync-events.md` for the full `sync$()` reference and caveats
(can't close over Qwik state directly; can't call imported / scoped
functions; serialized into HTML so keep it small).

For simple unconditional cases, the HTML attribute is even better:

```tsx
<a href="..." preventdefault:click>Link</a>
```

### When to disable the rule

If the conditional logic in your handler is too entangled with Qwik state
to split cleanly (many branches, each gated on different signals or
computed values, no clean way to mirror the decision into a single
`data-*` attribute), an `eslint-disable qwik/no-async-prevent-default`
block is a pragmatic last resort:

```tsx
/* eslint-disable qwik/no-async-prevent-default */
const handleKeyDown$ = $(
  (event: KeyboardEvent, element: HTMLTextAreaElement) => {
    // ... complex branching with preventDefault() calls ...
  },
);
/* eslint-enable qwik/no-async-prevent-default */
```

Leave a comment explaining why `sync$()` wasn't viable. The rule is a
"warn" by default and won't fail the build — but the IDE diagnostics are
noisy without the disable, and silencing them without an explanation makes
the next maintainer wonder.

Reach for `sync$()` first; the lint rule exists for a reason.
