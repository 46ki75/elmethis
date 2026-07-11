---
name: a2ui-knowledge
description: >
  Expert guidance for implementing the A2UI (Agent to UI) protocol — covering
  surfaces, components, data binding, catalogs, message streams (v0.9 / v0.9.1:
  createSurface / updateComponents / updateDataModel / deleteSurface; v1.0 adds
  callFunction / functionResponse / actionResponse; v0.8: surfaceUpdate /
  dataModelUpdate / beginRendering), the A2A extension binding, custom
  component catalogs (schemas, renderers, negotiation, versioning, graceful
  degradation), client/renderer architecture (MessageProcessor / SurfaceModel
  / ComponentImplementation / Binder), custom functions, the sendDataModel
  flag, surfaceProperties, and v0.8 → v0.9 → v0.9.1 → v1.0 migration. Always
  invoke for any question that mentions A2UI, surfaceUpdate, beginRendering,
  createSurface,
  updateComponents, updateDataModel, sendDataModel, callFunction,
  functionResponse, actionResponse, surfaceProperties,
  a2uiClientCapabilities, supportedCatalogIds, catalogId, basic_catalog,
  formatString, ChildList, ComponentId, or agent-driven UI streaming.
license: MIT
metadata:
  author: "Ikuma Yamashita"
  version: "2.0.0"
---

# A2UI Skill

You are an expert in the A2UI (Agent to UI) protocol — a declarative,
streaming JSON protocol that lets AI agents generate rich, interactive UIs
which render natively on any platform (web, mobile, desktop) without
executing arbitrary code.

## What A2UI Is

A2UI transmits abstract component trees as streams of JSON messages. The
agent describes UI structure; the client renders it with its own native
widgets. Key properties:

- **Declarative and LLM-friendly** — flat component lists keyed by id
  (adjacency-list model) so the LLM doesn't have to generate deeply nested
  JSON in a single pass.
- **Platform-agnostic** — the same JSON renders on React, Angular, Lit,
  Flutter, iOS, Android.
- **Separation of concerns** — UI structure, application state, and
  rendering are decoupled.
- **Secure** — declarative data only, no code execution. Component types
  are restricted to an allowlist (the active catalog).

## Versions

Per upstream `docs/roadmap.md`:

| Version | Status                  | Key server-to-client message types                                                |
| :------ | :---------------------- | :-------------------------------------------------------------------------------- |
| v0.8    | Prior (minimal support) | `surfaceUpdate`, `dataModelUpdate`, `beginRendering`, `deleteSurface`             |
| v0.9    | Prior (legacy support)  | `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`           |
| v0.9.1  | Current (stable)        | identical to v0.9                                                                 |
| v1.0    | Candidate (release)     | v0.9 set plus `callFunction` and `actionResponse`; adds client `functionResponse` |

Default to **v0.9.1** for production work; it is the current stable release
and is wire-compatible with v0.9. Use **v1.0** when the user wants the release
candidate's RPC features (synchronous `actionResponse`, server-initiated
`callFunction`/`functionResponse`), `surfaceProperties`, or single-message UI
instantiation. Use **v0.9 / v0.8** only when working on or migrating from an
existing deployment.

v0.9 introduced the **prompt-first** redesign: the schema is meant to live in
the LLM's system prompt rather than rely solely on structured output. It has a
flatter component syntax, standard JSON for data models, a unified catalog
(components + functions), the optional `sendDataModel` flag on `createSurface`
for client-to-server data sync, and a structured `VALIDATION_FAILED` feedback
loop. v0.8 was optimized for strict structured output / function calling.

**v0.9.1** is a minor refinement of v0.9: the payload MIME type is
standardized to `application/a2ui+json` (the legacy `application/json+a2ui`
is dropped), and `surfaceId` uniqueness is relaxed from the renderer's full
lifetime to currently-active surfaces only. Message names are identical to
v0.9, so the v0.9 protocol reference remains substantively accurate for
v0.9.1.

**v1.0** (release candidate) adds bidirectional RPC (`actionResponse`,
`callFunction`/`functionResponse`), replaces `theme` with `surfaceProperties`
(dropping `primaryColor`), allows inline `components`/`dataModel` directly in
`createSurface`, turns the catalog `functions` list into a name-keyed map,
embeds catalog `instructions` (replacing `rules.txt`), enforces UAX #31
identifier naming, adds the `@index` template function, and switches
`updateDataModel` deletion to explicit `null`. See `references/v1.0/`.

## Core Concepts

- **Surface** — a named UI region (chat bubble, side panel, dialog). Has
  its own component tree and data model. One stream can drive many.
- **Component** — an abstract UI element (`Text`, `Button`, `Row`, `Card`,
  …) drawn from a catalog. Components reference children by id, not by
  nesting.
- **Data Model** — a JSON object per surface; components bind to JSON
  Pointer paths within it. v0.9 supports relative paths inside templates.
- **Catalog** — a JSON Schema document defining the available component and
  function types. The Basic Catalog is the spec's reference; production apps
  usually define their own. v1.0 catalogs also carry `instructions`
  (inline Markdown) and a name-keyed `functions` map.
- **A2A Extension** — how A2UI is advertised and activated when transported
  over the A2A protocol. Each protocol version has its own activation URI:
  - v0.8: `https://a2ui.org/a2a-extension/a2ui/v0.8`
  - v0.9: `https://a2ui.org/a2a-extension/a2ui/v0.9`
  - v0.9.1: `https://a2ui.org/a2a-extension/a2ui/v0.9.1`
  - v1.0: `https://a2ui.org/a2a-extension/a2ui/v1.0`

## Reference Files

Read the appropriate reference as needed.

### v1.0 (release candidate)

- **`references/v1.0/protocol.md`** — Full v1.0 protocol: the four core
  messages plus `callFunction`/`actionResponse`, `surfaceProperties`,
  inline `components`/`dataModel` in `createSurface`, `null`-based
  `updateDataModel` deletion, the `@index` template function, UAX #31
  identifier rules, and `INVALID_FUNCTION_CALL`.
- **`references/v1.0/a2a-extension.md`** — v1.0 extension URI,
  `application/a2ui+json` DataPart encoding, list semantics, and the v1.0
  capability metadata.
- **`references/v1.0/evolution-guide.md`** — v0.9 → v0.9.1 → v1.0 migration:
  every schema/message/catalog change plus agent-side and renderer-side
  migration checklists.
- **`references/v1.0/custom-functions.md`** — v1.0 custom functions: the
  name-keyed `functions` map, `callableFrom` execution boundaries,
  `returnType` as catalog metadata, server-initiated `callFunction`, and the
  `INVALID_FUNCTION_CALL` contract.
- **`references/v1.0/basic-catalog-guide.md`** — v1.0 Basic Catalog: new
  props (`Video.posterUrl`, `TextField.placeholder`, `Slider.steps`), the
  `Icon` `path` rename, `surfaceProperties`, and catalog `instructions`.
- **`references/v1.0/renderer-guide.md`** — v1.0 renderer architecture:
  handling `callFunction`/`functionResponse`, `actionResponse` write-back,
  `@index` collection scope, and execution-boundary enforcement.
- **`references/v1.0/custom-catalog-guide.md`** — v1.0 custom catalogs: the
  `functions` map, `callableFrom`, inline `instructions`, standard JSON
  Schema metadata, UAX #31 naming, negotiation, and versioning.

### v0.9 / v0.9.1 (legacy / current stable)

The v0.9 references below are substantively accurate for **v0.9.1** as well —
the only v0.9.1 differences are the `application/a2ui+json` MIME type and the
relaxed `surfaceId` uniqueness rule (see `references/v1.0/evolution-guide.md`).

- **`references/v0.9/protocol.md`** — Full v0.9 protocol: `createSurface`
  (with the `sendDataModel` boolean property), `updateComponents`,
  `updateDataModel`, `deleteSurface`, flat component syntax with
  `"component": "Type"`, JSON-Pointer binding, root/relative scope,
  `formatString`, the prompt → generate → validate loop, and capability
  metadata.
- **`references/v0.9/a2a-extension.md`** — v0.9 extension URI, Agent Card
  params, list-of-messages DataPart encoding, metadata fields
  (`a2uiClientCapabilities`, `a2uiClientDataModel`).
- **`references/v0.9/evolution-guide.md`** — Comprehensive v0.8 → v0.9
  diff: philosophy shift, renamed messages, schema changes, component
  property renames, and a migration checklist. Read this when helping
  someone migrate or explaining why v0.9 looks different.
- **`references/v0.9/custom-functions.md`** — How to define custom
  functions inside a catalog, expose them via `anyFunction`, and have
  validators recognize them (e.g. `trim`, `getScreenResolution`).
- **`references/v0.9/basic-catalog-guide.md`** — Per-component rendering
  guidance for every Basic Catalog component and function, plus the
  Leaf-Margin spacing strategy and color/contrast inheritance pattern.
- **`references/v0.9/renderer-guide.md`** — Client/renderer architecture:
  the agnostic data layer (`MessageProcessor`, `SurfaceModel`,
  `DataModel`, `ComponentContext`), the catalog API, three binder
  strategies (direct, binder layer, generic), lifecycle/memory rules, and
  the step-by-step build plan.
- **`references/v0.9/custom-catalog-guide.md`** — End-to-end custom
  catalog workflow: defining a schema, extending or cherry-picking from
  the Basic Catalog, bundling with `assemble_catalog.py`, the four-step
  authoring loop (schema → implement → register → invoke), the
  catalog-negotiation handshake, versioning + breaking-change rules,
  two-phase validation, graceful degradation, security, and agent-side
  ADK integration (`A2uiSchemaManager`, `SendA2uiToClientToolset`,
  `A2uiEventConverter`).

### v0.8 (prior)

- **`references/v0.8/protocol.md`** — Full v0.8 protocol: message schemas
  (`surfaceUpdate`, `dataModelUpdate`, `beginRendering`, `deleteSurface`),
  the `BoundValue` typed-literal pattern (`literalString` / `path` /
  initialization shorthand), key-wrapped component objects
  (`{"Text": {...}}`), `explicitList` vs `template` for container
  children, and the canonical client-side architecture.
- **`references/v0.8/a2a-extension.md`** — v0.8 extension URI, Agent Card
  declaration, activation, single-message DataPart encoding,
  `a2uiClientCapabilities` in metadata.
- **`references/v0.8/custom-catalog.md`** — Per-request catalog
  negotiation (the change that landed in v0.8), `supportedCatalogIds`,
  `inlineCatalogs`, `acceptsInlineCatalogs`, per-surface `catalogId` in
  `beginRendering`, and the implementation guide for agent and renderer
  developers.

## When to Read Which Files

| User is asking about…                                              | Read                                      |
| :----------------------------------------------------------------- | :---------------------------------------- |
| v1.0 message format / schema (the release candidate)               | `references/v1.0/protocol.md`             |
| `callFunction` / `functionResponse` / `actionResponse`             | `references/v1.0/protocol.md`             |
| `surfaceProperties`, inline `components`/`dataModel`               | `references/v1.0/protocol.md`             |
| `@index`, UAX #31 naming, `null`-based deletion                    | `references/v1.0/protocol.md`             |
| v1.0 A2A integration                                               | `references/v1.0/a2a-extension.md`        |
| v0.9 → v0.9.1 → v1.0 migration / which version to use              | `references/v1.0/evolution-guide.md`      |
| v1.0 custom functions / `callableFrom` / execution boundaries      | `references/v1.0/custom-functions.md`     |
| v1.0 Basic Catalog props (`posterUrl`, `placeholder`, `steps`)     | `references/v1.0/basic-catalog-guide.md`  |
| Building a v1.0 client / handling `callFunction`                   | `references/v1.0/renderer-guide.md`       |
| v1.0 custom component catalog                                      | `references/v1.0/custom-catalog-guide.md` |
| v0.9 / v0.9.1 message format / schema                              | `references/v0.9/protocol.md`             |
| v0.9 / v0.9.1 A2A integration                                      | `references/v0.9/a2a-extension.md`        |
| v0.8 → v0.9 migration / differences                                | `references/v0.9/evolution-guide.md`      |
| Custom functions (defining, validating, registering)               | `references/v0.9/custom-functions.md`     |
| Rendering specific components (Text, Button, Card, Modal, …)       | `references/v0.9/basic-catalog-guide.md`  |
| Building a client / renderer / MessageProcessor                    | `references/v0.9/renderer-guide.md`       |
| Custom component catalog (define / register / negotiate / version) | `references/v0.9/custom-catalog-guide.md` |
| `supportedCatalogIds` / catalog negotiation handshake              | `references/v0.9/custom-catalog-guide.md` |
| Catalog versioning, breaking changes, migration                    | `references/v0.9/custom-catalog-guide.md` |
| Agent-side ADK integration (`SendA2uiToClientToolset`, etc.)       | `references/v0.9/custom-catalog-guide.md` |
| Two-phase validation, graceful degradation                         | `references/v0.9/custom-catalog-guide.md` |
| Leaf-Margin spacing strategy / color inheritance                   | `references/v0.9/basic-catalog-guide.md`  |
| `formatString`, `${...}` interpolation                             | `references/v0.9/protocol.md`             |
| `sendDataModel`, two-way binding, data sync                        | `references/v0.9/protocol.md`             |
| v0.8 message format / schema                                       | `references/v0.8/protocol.md`             |
| v0.8 A2A integration                                               | `references/v0.8/a2a-extension.md`        |
| v0.8 custom catalogs / `inlineCatalogs`                            | `references/v0.8/custom-catalog.md`       |

## Working Tips

- The v0.9 / v0.9.1 server-to-client message stream has exactly **four**
  methods: `createSurface`, `updateComponents`, `updateDataModel`,
  `deleteSurface`. `sendDataModel` is **not** a fifth message — it is a
  boolean property **inside** `createSurface` that turns on client-to-server
  data sync. v1.0 adds two more server-to-client messages
  (`callFunction`, `actionResponse`) and a client-to-server `functionResponse`.
- When a user mentions `callFunction`, `functionResponse`, `actionResponse`,
  or `surfaceProperties`, you're in v1.0 territory. `createSurface` /
  `updateComponents` / `updateDataModel` with `theme` are v0.9 / v0.9.1.
  `surfaceUpdate`, `dataModelUpdate`, `beginRendering`, or `literalString`
  are v0.8. When unclear, ask which version they're targeting.
- Catalog schemas must use `common_types.json` references for ids and
  child lists (`ComponentId`, `ChildList`) — raw `"type": "string"` makes
  validators silently miss broken references.
- In v1.0, catalog `functions` is a **name-keyed map** (not a list),
  function names must conform to UAX #31, and the `@` prefix is reserved
  for system functions like `@index` — custom catalogs MUST NOT define
  `@`-prefixed functions.
- The `${...}` string-interpolation syntax is valid **only** inside the
  `formatString` function. Don't suggest it in arbitrary string properties.
- A2A `DataPart.data` is a **list** of A2UI messages (since v0.9), processed
  sequentially with per-message atomicity. The current MIME type is
  `application/a2ui+json` (standardized in v0.9.1); the legacy
  `application/json+a2ui` appears only in pre-v0.9.1 deployments. v0.8 used a
  single message, not a list.
- Source files in this skill end with a `Source:` footer pointing back to
  the upstream spec `.md` in the `a2ui-project/a2ui` repo, so you can verify
  or re-sync against the spec.
