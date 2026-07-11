# A2UI v0.8 Protocol Reference

A2UI v0.8 is a JSONL-based streaming UI protocol that lets an agent describe a
component tree and data model which a client renders with native widgets. v0.8
is the **prior** release — feature-complete v0.9 is now recommended, but v0.8
remains in use by existing deployments.

## Table of Contents

- [Design Principles](#design-principles)
- [Server-to-Client Message Types](#server-to-client-message-types)
- [Surfaces](#surfaces)
- [Catalog Negotiation](#catalog-negotiation)
- [Component Model](#component-model)
- [UI Composition (Adjacency List, Templates)](#ui-composition)
- [Data Model and Binding](#data-model-and-binding)
- [Event Handling (Client → Server)](#event-handling)
- [Client-Side Architecture](#client-side-architecture)
- [Full Stream Example](#full-stream-example)

## Design Principles

- **Declarative, flat structure** — components form an adjacency list keyed by
  `id`, not a nested tree. This is far easier for an LLM to generate
  incrementally and tolerates out-of-order messages.
- **Stateless messages** — each JSONL line is self-contained
  (`surfaceUpdate`, `dataModelUpdate`, `beginRendering`, `deleteSurface`).
- **Progressive rendering** — the client buffers until it sees `beginRendering`,
  then renders from the supplied `root` component.
- **Platform-agnostic** — the wire format only references abstract component
  names; the client maps them to native widgets via a Widget Registry.
- **Separation of structure and state** — `surfaceUpdate` defines components;
  `dataModelUpdate` carries dynamic values that components bind to.
- **Unidirectional UI stream** — UI flows server → client (typically SSE).
  User interactions flow back as separate A2A messages.

## Server-to-Client Message Types

v0.8 defines four message types. Each is a top-level object with a single
discriminator key.

| Message | Purpose |
| :--- | :--- |
| `surfaceUpdate` | Add or replace component definitions on a surface |
| `dataModelUpdate` | Insert / replace data inside a surface's data model |
| `beginRendering` | Signal the client to render; pick the `root` component and (optionally) a catalog |
| `deleteSurface` | Remove a surface and all its UI |

### `surfaceUpdate`

```json
{
  "surfaceUpdate": {
    "surfaceId": "main_content_area",
    "components": [
      {
        "id": "unique-component-id",
        "component": {
          "Text": { "text": { "literalString": "Hello, World!" } }
        }
      }
    ]
  }
}
```

- `components` is a flat list of `{ id, component }` pairs.
- `component` is a wrapper that must contain exactly one key — the component
  type name from the active catalog (e.g. `"Text"`, `"Row"`, `"Button"`).

### `dataModelUpdate`

`contents` is an **adjacency list** of typed entries — each entry has a `key`
and exactly one `value*` field.

```json
{
  "dataModelUpdate": {
    "surfaceId": "main_content_area",
    "path": "user",
    "contents": [
      {"key": "name", "valueString": "Bob"},
      {"key": "isVerified", "valueBoolean": true},
      {
        "key": "address",
        "valueMap": [
          {"key": "street", "valueString": "123 Main St"},
          {"key": "city",   "valueString": "Anytown"}
        ]
      }
    ]
  }
}
```

Typed value fields: `valueString`, `valueNumber`, `valueBoolean`, `valueMap`
(nested adjacency list), `valueArray`. If `path` is omitted, the update applies
to the root of the surface's data model.

### `beginRendering`

```json
{
  "beginRendering": {
    "surfaceId": "unique-surface-1",
    "catalogId": "https://my-company.com/inline_catalogs/temp-catalog",
    "root": "root-component-id"
  }
}
```

- `surfaceId` — which surface to render.
- `root` — id of the component used as the surface's root.
- `catalogId` — optional. If omitted the client **MUST** default to the
  standard catalog (`https://a2ui.org/specification/v0_8/standard_catalog_definition.json`).

### `deleteSurface`

```json
{ "deleteSurface": { "surfaceId": "side_panel" } }
```

Removes the surface, its component buffer entries, and its data model.

## Surfaces

A **Surface** is a controllable region of screen real estate. Each surface
has:

- its own component buffer (`Map<componentId, Component>`),
- its own data model (independent JSON object), and
- its own root component / catalog choice.

A single A2UI stream can drive many surfaces in parallel (e.g. a chat history
where each assistant turn is rendered into a separate surface, plus a sticky
side panel).

## Catalog Negotiation

A **Catalog** is a JSON-Schema-style document listing the component types the
client can render and their properties. v0.8 introduces a flexible three-step
negotiation:

### 1. Agent advertises capability (Agent Card)

```json
{
  "uri": "https://a2ui.org/a2a-extension/a2ui/v0.8",
  "params": {
    "supportedCatalogIds": [
      "https://a2ui.org/specification/v0_8/standard_catalog_definition.json",
      "https://my-company.com/a2ui/v0.8/my_custom_catalog.json"
    ],
    "acceptsInlineCatalogs": true
  }
}
```

`supportedCatalogIds` is a soft signal — orchestrating agents may delegate to
subagents whose catalogs are not advertised, so clients should treat this as a
subset of true support.

### 2. Client declares supported catalogs on every message

The client adds `a2uiClientCapabilities` to the A2A `Message.metadata` of
**every** outbound message:

```json
{
  "metadata": {
    "a2uiClientCapabilities": {
      "supportedCatalogIds": [
        "https://a2ui.org/specification/v0_8/standard_catalog_definition.json"
      ],
      "inlineCatalogs": [
        {
          "catalogId": "https://my-company.com/inline_catalogs/temp-signature-pad-catalog",
          "components": {
            "SignaturePad": {
              "type": "object",
              "properties": {"penColor": {"type": "string"}}
            }
          },
          "styles": {}
        }
      ]
    }
  }
}
```

- `supportedCatalogIds` (required) — IDs of pre-compiled catalogs the renderer
  ships with. Include the standard catalog ID explicitly if you support it.
  These contents must be compiled in, not fetched at runtime — that's the
  guardrail against prompt-injected catalogs.
- `inlineCatalogs` (optional) — full catalog definition documents supplied at
  runtime. Only allowed when the agent advertised
  `acceptsInlineCatalogs: true`. Primarily intended for local development.

### 3. Server selects per-surface

The agent picks a catalog for each surface and sets it on `beginRendering`:

```json
{
  "beginRendering": {
    "surfaceId": "s1",
    "catalogId": "https://my-company.com/inline_catalogs/temp-signature-pad-catalog",
    "root": "root"
  }
}
```

The chosen `catalogId` must appear in the client's `supportedCatalogIds` or as
a `catalogId` inside an `inlineCatalogs` entry. Omit `catalogId` to mean
"use the standard catalog."

### Schemas for developers

The generic `server_to_client.json` is the abstract wire schema. For agent
implementation, resolve it against your target catalog so the LLM sees the
exact components and styles available:

```python
component_properties = custom_catalog_definition["components"]
style_properties     = custom_catalog_definition["styles"]
resolved_schema = copy.deepcopy(server_to_client_schema)
resolved_schema["properties"]["surfaceUpdate"]["properties"] \
    ["components"]["items"]["properties"]["component"] \
    ["properties"] = component_properties
resolved_schema["properties"]["beginRendering"]["properties"] \
    ["styles"]["properties"] = style_properties
```

`server_to_client_with_standard_catalog.json` is the pre-resolved form for the
standard catalog.

## Component Model

Each entry in `components` is:

- `id` (string, required) — unique within the surface; referenced by parents.
- `component` (object, required) — **exactly one key**, naming the component
  type from the catalog. The value is that type's properties:

```json
"component": {
  "Button": {
    "label": { "literalString": "Click Me" },
    "action": { "name": "submit_form" }
  }
}
```

The set of valid component type names and property shapes is **not** in the
core schema — it comes from the active catalog.

## UI Composition

### Adjacency list model

The UI is sent as a flat list. Parent/child relationships are expressed by
component-`id` references, not nesting. The client stores all components in a
`Map<id, Component>` and reconstructs the tree at render time.

This means messages can arrive in any order; only the final `beginRendering`
matters for the first render.

### Container children: `explicitList` vs `template`

Containers like `Row`, `Column`, `List` use a `children` object that contains
**exactly one** of:

- `explicitList: ["id1", "id2", ...]` — static, known children.
- `template: { dataBinding: <DataPath>, componentId: "<id>" }` — dynamic list:
  iterate over the bound data, render `componentId` once per item, exposing the
  item to the template for relative binding.

## Data Model and Binding

### The `BoundValue` object

Bindable component properties (e.g. `text` on `Text`) accept a `BoundValue`:

```json
{
  "literalString": "static value",   // OR another literal* type
  "path": "/data/path"               // OR a JSON-Pointer path
}
```

Behaviors:

- **Literal only** — `"text": { "literalString": "Hello" }` — static.
- **Path only** — `"text": { "path": "/user/name" }` — dynamic, resolved at
  render time and re-resolved on data model updates.
- **Both = initialization shorthand** — `"text": { "path": "/user/name", "literalString": "Guest" }`
  — the client must (1) implicitly write the literal into the data model at
  `path`, then (2) bind to that path. Lets the server set a default and bind
  it in one step.

Typed literals: `literalString`, `literalNumber`, `literalBoolean`,
`literalArray`.

v0.8 binding is direct 1:1 — there are **no transformers / formatters /
conditionals**. Any data transformation must be done server-side before the
`dataModelUpdate`.

## Event Handling

User interactions return to the server as A2A messages. The payload is a
JSON object with exactly one of `userAction` or `error`.

### `userAction`

```json
{
  "userAction": {
    "name": "submit_form",
    "surfaceId": "main_content_area",
    "sourceComponentId": "submit_btn",
    "timestamp": "2025-09-19T17:05:00Z",
    "context": {
      "userInput": "User input text",
      "formId": "f-123"
    }
  }
}
```

The client builds `context` by iterating the component's `action.context`
array and resolving each `BoundValue` against the surface's data model.

### `error`

A flexible feedback channel — sent when the client hits a rendering or
binding error. The payload shape is intentionally open.

### Round-trip

User action → A2A message → server processes → server emits new
`surfaceUpdate` / `dataModelUpdate` / `deleteSurface` over the same SSE
stream → client updates buffers and re-renders.

## Client-Side Architecture

A working v0.8 client typically has:

- **JSONL parser** — line-delimited reader over SSE.
- **Message dispatcher** — routes by message-type key.
- **Component buffer** — `Map<id, Component>` per surface.
- **Data model store** — JSON object per surface.
- **Interpreter state** — tracks "ready to render" (flipped by
  `beginRendering`).
- **Widget registry** — caller-supplied map from component-type names to
  native widget builders.
- **Binding resolver** — turns a `BoundValue` into a concrete value.
- **Surface manager** — creates/deletes surfaces by `surfaceId`.
- **Event handler** — builds and dispatches `userAction` / `error` back over
  A2A.

## Full Stream Example

```jsonl
{"surfaceUpdate": {"components": [{"id": "root", "component": {"Column": {"children": {"explicitList": ["profile_card"]}}}}]}}
{"surfaceUpdate": {"components": [{"id": "profile_card", "component": {"Card": {"child": "card_content"}}}]}}
{"surfaceUpdate": {"components": [{"id": "card_content", "component": {"Column": {"children": {"explicitList": ["header_row", "bio_text"]}}}}]}}
{"surfaceUpdate": {"components": [{"id": "header_row", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["avatar", "name_column"]}}}}]}}
{"surfaceUpdate": {"components": [{"id": "avatar", "component": {"Image": {"url": {"literalString": "https://www.example.com/profile.jpg"}}}}]}}
{"surfaceUpdate": {"components": [{"id": "name_column", "component": {"Column": {"alignment": "start", "children": {"explicitList": ["name_text", "handle_text"]}}}}]}}
{"surfaceUpdate": {"components": [{"id": "name_text", "component": {"Text": {"usageHint": "h3", "text": {"literalString": "A2A Fan"}}}}]}}
{"surfaceUpdate": {"components": [{"id": "handle_text", "component": {"Text": {"text": {"literalString": "@a2a_fan"}}}}]}}
{"surfaceUpdate": {"components": [{"id": "bio_text", "component": {"Text": {"text": {"literalString": "Building beautiful apps from a single codebase."}}}}]}}
{"dataModelUpdate": {"contents": {}}}
{"beginRendering": {"root": "root"}}
```

---

Source: `submodules/A2UI/specification/v0_8/docs/a2ui_protocol.md`.
