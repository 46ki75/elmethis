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
   - Classify Solid core and SolidStart separately as v1 or v2 before using an
     example. Solid v2 documentation is beta and SolidStart v2 conventions
     differ materially from v1; do not infer compatibility from similar names.
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
  stable while values change in Solid v1. Use `<Show>`, `<Switch>`, and
  `<Match>` to make conditional ownership explicit where they improve
  correctness. Check the v2 control-flow APIs rather than carrying v1 names
  forward.
- Use `<Dynamic>` when runtime state selects the element or component type,
  `<Portal>` for intentionally out-of-tree DOM, and `lazy` for code splitting.
  Their imports and async boundaries differ between v1 and v2.
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
- Do not mix stable v1 examples with `/v2/` APIs. Important differences include
  web-package imports, effects, store setters, list primitives, loading/error
  boundaries, SolidStart configuration, middleware, and HTTP helpers.
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
- A dynamic element or component is selected without the version-appropriate
  `Dynamic` API, or a portal is assumed to render during SSR.
- Delegated and native event handlers are treated as interchangeable, or a
  changing handler is expected to rebind reactively.
- A list uses array mapping in a way that recreates avoidable DOM or loses the
  intended identity semantics.
- Route preload and component reads use different query keys or parameters.
- A server action trusts identifiers or authorization data from the browser.
- Server-only dependencies leak into the client bundle.
- Metadata is rendered outside `MetaProvider` or mutated through `document`.
- Browser globals execute during server rendering.
- Shared server state can cross requests.
- Streaming starts before a redirect, cookie/session update, status, header, or
  SEO-critical value is resolved.
- A cookie-authenticated mutation lacks CSRF protection.

## Output

For implementation tasks, edit the project rather than only describing a
solution. Summarize changed files, the Solid-specific reasoning behind the
change, and verification performed. For reviews, lead with concrete findings
and file references. Mention version assumptions or unrun checks plainly.

## Documentation

These references capture durable patterns, not a substitute for versioned API
documentation. `references/core.md` documents stable Solid v1 unless a section
explicitly says otherwise. For Solid v2 and version-sensitive ecosystem work,
consult the matching versioned pages and installed declarations:

- <https://docs.solidjs.com/llms.txt> is the machine-readable documentation
  index spanning Solid core, Router, SolidStart, Meta, testing, and versioned
  documentation. Use it to discover the relevant page, then read that linked
  page and match stable or `/v2/` guidance to the project's installed versions.
- <https://docs.solidjs.com/>
- <https://docs.solidjs.com/solid-router>
- <https://docs.solidjs.com/solid-start>
- <https://docs.solidjs.com/solid-meta>
