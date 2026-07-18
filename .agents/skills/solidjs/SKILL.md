---
name: solidjs
description: Build, debug, refactor, review, and test applications across the Solid ecosystem. Use this skill whenever a task involves SolidJS, SolidStart, @solidjs/router, @solidjs/meta, signals, stores, fine-grained reactivity, Solid file routes, server functions, actions, metadata, SSR, or hydration, even when the user only says "Solid app" or asks to migrate React-style TSX. It prevents React mental-model mistakes and guides selection of current Solid APIs.
compatibility: Requires a Solid project or permission to create one, plus the project's Node.js package manager for verification. Current documentation access is useful when installed package versions differ from these references.
license: MIT
metadata:
  author: "Ikuma Yamashita"
  version: "1.0.0"
---

# Solid Ecosystem Engineering

Treat Solid as a fine-grained reactive system, not as React with different
hooks. Components normally execute once to establish DOM and reactive
subscriptions; tracked computations update only the expressions that read
reactive sources.

## Workflow

1. Inspect the repository before proposing code.
   - Read `package.json`, lockfiles, TypeScript and Vite/Vinxi configuration.
   - Identify installed versions of `solid-js`, `@solidjs/router`,
     `@solidjs/start`, and `@solidjs/meta`.
   - Follow the project's package manager, file layout, linting, and tests.
2. Classify the task by ecosystem layer and read the matching reference:
   - Core state, components, JSX, lifecycle: `references/core.md`
   - Client or universal routing and router data APIs:
     `references/router.md`
   - File routes, server code, middleware, SSR, deployment:
     `references/solidstart.md`
   - Document head and SEO: `references/meta.md`
   - Test setup and verification: `references/testing.md`
3. Trace reactive ownership and data flow before editing.
   - Mark signals, stores, props, memos, resources, and async boundaries.
   - Determine which reads must stay reactive and which work needs cleanup.
   - For SSR code, separate request-local state from module-global state.
4. Make the smallest change that fits the installed versions and existing
   architecture. Do not rewrite a plain Solid app into SolidStart, or vice
   versa, unless requested.
5. Verify behavior using the repository's existing commands. At minimum run
   the most relevant tests and typecheck or build when available.

## Core Decisions

- Use a signal for a local scalar or independently changing value.
- Use a store for nested state that benefits from path-based updates.
- Use a memo for derived reactive values. Effects are for synchronizing with
  systems outside Solid, not for copying derivable state into another signal.
- Read reactive props through `props` or helpers such as `splitProps` and
  `mergeProps`. Plain destructuring can capture a non-reactive value.
- Put browser subscriptions, timers, and imperative widgets under an owner and
  pair them with `onCleanup`.
- Use `<For>` for lists keyed by item identity and `<Index>` when positions are
  stable while values change. Use `<Show>`, `<Switch>`, and `<Match>` to make
  conditional ownership explicit where they improve correctness.
- Model asynchronous route data with the APIs already chosen by the project.
  In current Router and SolidStart code, prefer `query` plus `createAsync`
  when the installed version supports them.

## Guardrails

- Do not add React APIs or assumptions: no `useState`, `useEffect`, dependency
  arrays, component rerender reasoning, or React-specific memoization advice.
- Do not invoke signal accessors too early when a callback or JSX expression
  must remain reactive.
- Do not place mutable user or request state in server module globals.
- Do not access `window`, `document`, `localStorage`, or browser-only libraries
  during SSR without a client-only boundary or lifecycle guard.
- Do not invent imports. Check installed declarations or current official docs
  when an API is version-sensitive.
- Preserve progressive enhancement for router actions and forms when the
  application already uses that model.
- Include pending, empty, error, and success states for asynchronous UI when
  they matter to the requested behavior.

## Review Checklist

When reviewing or debugging, check these failure modes explicitly:

- Props or store values were destructured and stopped updating.
- A derived value is synchronized through an effect instead of computed.
- An effect creates subscriptions repeatedly or lacks cleanup.
- A signal accessor is rendered or compared without being called.
- A list uses array mapping in a way that recreates avoidable DOM or loses the
  intended identity semantics.
- Route preload and component reads use different query keys or parameters.
- A server action trusts identifiers or authorization data from the browser.
- Server-only dependencies leak into the client bundle.
- Metadata is rendered outside `MetaProvider` or mutated through `document`.
- Browser globals execute during server rendering.
- Shared server state can cross requests.

## Output

For implementation tasks, edit the project rather than only describing a
solution. Summarize changed files, the Solid-specific reasoning behind the
change, and verification performed. For reviews, lead with concrete findings
and file references. Mention version assumptions or unrun checks plainly.

## Documentation

These references capture durable patterns, not a substitute for versioned API
documentation. For version-sensitive work, consult the official sites:

- <https://docs.solidjs.com/>
- <https://docs.solidjs.com/solid-router>
- <https://docs.solidjs.com/solid-start>
- <https://docs.solidjs.com/solid-meta>
