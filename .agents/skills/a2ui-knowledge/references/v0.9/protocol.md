# A2UI v0.9 Protocol Reference

A2UI v0.9 is the **current, feature-complete** release of the protocol. It is
a "prompt-first" redesign of v0.8: the schema is meant to be embedded directly
in an LLM's system prompt rather than rely solely on structured-output / function
calling. The trade-off is that the LLM is no longer strictly constrained by the
schema, so robust post-generation validation and a "validate-then-correct" loop
are mandatory parts of a real implementation.

## Table of Contents

- [Server-to-Client Message Types](#server-to-client-message-types)
- [The Schema Layout](#the-schema-layout)
- [Components and the Adjacency List Model](#components-and-the-adjacency-list-model)
- [Actions](#actions)
- [Data Model: Binding and Scope](#data-model-binding-and-scope)
- [Two-Way Binding for Inputs](#two-way-binding-for-inputs)
- [Data Synchronization (`sendDataModel`)](#data-synchronization-senddatamodel)
- [Functions and Validation](#functions-and-validation)
- [Basic Catalog](#basic-catalog)
- [`formatString` String Interpolation](#formatstring-string-interpolation)
- [Prompt → Generate → Validate Loop](#prompt--generate--validate-loop)
- [Client-to-Server Messages](#client-to-server-messages)
- [Capabilities (Server and Client)](#capabilities-server-and-client)
- [Transport Decoupling](#transport-decoupling)
- [Full Example Stream](#full-example-stream)

## Server-to-Client Message Types

Each top-level envelope contains **exactly one** of these four keys:

| Message | Purpose |
| :--- | :--- |
| `createSurface` | Create a new surface, bind it to a catalog and theme, optionally turn on data-model sync |
| `updateComponents` | Add or replace components in a surface (flat list, ID references) |
| `updateDataModel` | Upsert (or remove) a value at a JSON-Pointer path |
| `deleteSurface` | Remove a surface and all its state |

A surface must exist before any `updateComponents` / `updateDataModel` is sent
to it. `surfaceId` is fixed for the lifetime of the surface — to change
`catalogId` or `theme`, delete and recreate. Sending `createSurface` for an
already-active `surfaceId` is an error.

### `createSurface`

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "user_profile_card",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
    "theme": { "primaryColor": "#00BFFF" },
    "sendDataModel": true
  }
}
```

- `surfaceId` (string, required) — unique within the session.
- `catalogId` (string, required) — identifier of the catalog this surface
  uses. Recommended pattern: a URI in a domain you own (e.g.
  `https://mycompany.com/1.0/somecatalog`). The URI is purely an identifier;
  no runtime fetch is performed.
- `theme` (object, optional) — values for the catalog's theme schema.
- `sendDataModel` (boolean, optional, default `false`) — if `true`, the client
  attaches the full data model of this surface to the metadata of every
  message it sends to the server.

Exactly one component in the resulting tree must have id `root`.

### `updateComponents`

Flat list of components. Parents reference children by id. Components may
arrive in any order, and may reference children that don't yet exist —
clients should render progressively and fill in as definitions arrive.

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "user_profile_card",
    "components": [
      { "id": "root", "component": "Column", "children": ["user_name", "user_title"] },
      { "id": "user_name", "component": "Text", "text": "John Doe" },
      { "id": "user_title", "component": "Text", "text": "Software Engineer" }
    ]
  }
}
```

If a re-emitted `id` has a **different** `component` type, the implementation
must remove the old component and create a fresh one — so framework
renderers reset their internal state.

### `updateDataModel`

Upserts at a JSON Pointer path. Omitting `value` removes the key. Omitting
`path` (or setting it to `/`) replaces the whole model.

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "user_profile_card",
    "path": "/user/name",
    "value": "Jane Doe"
  }
}
```

Arrays: omitted `value` at an index sets the slot to `undefined`, **preserving
length** (sparse array).

### `deleteSurface`

```json
{ "version": "v0.9", "deleteSurface": { "surfaceId": "user_profile_card" } }
```

Removes all components, data, and subscriptions for the surface.

## The Schema Layout

v0.9 splits the protocol into three interacting schemas:

1. **`common_types.json`** — reusable primitives:
   - `DynamicString` / `DynamicNumber` / `DynamicBoolean` / `DynamicStringList`
     — any bindable value. Accepts a literal, a `path`, or a `FunctionCall`.
   - `ChildList` — for container children. Either an `array` of `ComponentId`s
     or an `object` with a template `{ componentId, path }`.
   - `ComponentId` — a typed reference to another component within the surface.
2. **`server_to_client.json`** — the envelope. Uses a top-level `oneOf` to
   discriminate among the four message types. The envelope references the
   catalog through a relative `catalog.json` placeholder
   (`$ref: "catalog.json#/$defs/anyComponent"`).
3. **`basic_catalog.json`** — the default catalog: components, functions,
   theme schema. Custom catalogs follow the same shape and reuse the
   `common_types.json` primitives.

To validate a payload, alias `catalog.json` to whichever real catalog file
applies (`basic_catalog.json` or `my_company_catalog.json`). That indirection
is what makes catalogs swappable without modifying the envelope.

### Validator-compliance rules for custom catalogs

To let automated validators verify the component tree, custom catalogs MUST
use the typed primitives:

- Any property that holds the id of another component MUST use
  `$ref: "common_types.json#/$defs/ComponentId"` — not raw `"type": "string"`.
- Any list of children or template MUST use
  `$ref: "common_types.json#/$defs/ChildList"`.

Using raw `string` for an id makes the validator treat it as static text and
silently miss broken references.

## Components and the Adjacency List Model

A component object looks like:

```json
{
  "id": "user_name",       // ComponentId, required
  "component": "Text",     // discriminator, required
  "text": "John Doe"       // type-specific properties inline
}
```

Properties live **inline** on the same object, keyed by the catalog. The
discriminator approach (`"component": "Text"`) is the v0.9 successor to v0.8's
`{ "Text": { ... } }` wrapper — much easier for LLMs to emit consistently.

### Adjacency list

The UI is a flat list, parents reference children by id. The client stores
all components in a `Map<id, Component>` and builds the tree at render time.
This:

- lets the server stream components in any order,
- allows progressive rendering as soon as `root` is defined,
- means components may transiently reference children or data paths that
  don't exist yet — renderers must handle `undefined` gracefully (placeholder
  or loading state).

The tree must contain exactly **one** component with id `root`. Until `root`
exists, other component updates are buffered and have no visible effect.

### Containers with `ChildList`

Containers (`Row`, `Column`, `List`, …) define children either as:

- a static array of ids: `"children": ["a", "b", "c"]`, or
- a template that iterates over a data path:

  ```json
  {
    "id": "employee_list",
    "component": "List",
    "children": { "path": "/employees", "componentId": "employee_card_template" }
  }
  ```

When the container iterates a bound array, each instantiated child runs in a
**child scope** rooted at `/employees/N`.

## Actions

Interactive components use an `action` object. There are two flavors:

### Server action — emits an event over the transport

```json
{
  "component": "Button",
  "text": "Submit",
  "action": {
    "event": {
      "name": "submit_form",
      "context": { "itemId": "123" }
    }
  }
}
```

`context` is a standard JSON object (in v0.8 it was an array of key-value
pairs). Values can be literals, `{ "path": "..." }`, or function calls.

### Local action — executes a client-side function

```json
{
  "component": "Button",
  "text": "Open Link",
  "action": {
    "functionCall": {
      "call": "openUrl",
      "args": { "url": "${/url}" }
    }
  }
}
```

## Data Model: Binding and Scope

Bindings use JSON Pointer ([RFC 6901]) with one v0.9 extension: **relative
paths** that don't start with `/`.

### Root scope

By default a component is in the root scope:

- A path starting with `/` (e.g. `/user/profile/name`) is **absolute** and
  resolves from the data model root.

### Collection scope (relative paths)

When a container uses a template (`ChildList` with a bound `path`), a new
**child scope** is created per item. Inside that scope:

- a path **without** a leading `/` is **relative** and resolves against the
  current item: `firstName` becomes `/users/0/firstName`, `/users/1/firstName`,
  etc.
- a path **with** a leading `/` still escapes to root scope.

Example:

```jsonc
// Data model: { "company": "Acme Corp", "employees": [{...}, {...}] }
{ "id": "name_text",    "component": "Text", "text": { "path": "name" } }       // /employees/N/name
{ "id": "company_text", "component": "Text", "text": { "path": "/company" } }   // "Acme Corp"
```

### Type coercion

When a non-string value is interpolated, the client converts to string:

| Input | Result |
| :--- | :--- |
| number / boolean | standard string representation |
| `null` / `undefined` | `""` (empty string) |
| object / array | JSON-stringified |

## Two-Way Binding for Inputs

`TextField`, `CheckBox`, `Slider`, `ChoicePicker`, `DateTimeInput` establish
two-way bindings.

- **Read (model → view)**: component initial value comes from the bound path;
  the component re-renders on `updateDataModel`.
- **Write (view → model)**: user input writes **immediately** to the local
  data model at the bound path.

Two-way binding is **local to the client** — keystrokes don't trigger network
requests on their own. The server sees the new state only when a `Button`
(or other action source) fires and the `action.context` references the
modified path. (Or, if the surface was created with `sendDataModel: true`,
the full data model is attached automatically.)

## Data Synchronization (`sendDataModel`)

When a surface is created with `sendDataModel: true`, the client attaches
the surface's **entire** data model to the metadata of every message it
sends back to the server, following [`client_data_model.json`]
(`a2uiClientDataModel`).

Properties:

- **Targeted** — only sent to the server that created the surface.
- **Triggered** — only sent alongside a real client-to-server message
  (e.g. an action). Passive edits don't generate traffic.
- **Convergence** — the server treats the received model as the latest
  client state at the moment of the action.

## Functions and Validation

Functions are referenced by name via a `FunctionCall` object. They are
defined in the active catalog (so the schema can validate calls and the
LLM sees what's available); they are **not** executable code on the wire.

Validation `checks` on input components and buttons:

```json
"checks": [
  { "call": "required",
    "args": { "value": { "path": "/formData/zip" } },
    "message": "Zip code is required" },
  { "call": "regex",
    "args": { "value": { "path": "/formData/zip" }, "pattern": "^[0-9]{5}$" },
    "message": "Must be a 5-digit zip code" }
]
```

Failing checks surface the `message` and reactively disable the action
(e.g. the button becomes inert until all checks pass). Conditional logic
nests freely:

```json
{
  "component": "Button",
  "text": "Submit",
  "checks": [{
    "condition": {
      "call": "and",
      "args": { "values": [
        { "call": "required", "args": { "value": { "path": "/formData/terms" } } },
        { "call": "or", "args": { "values": [
          { "call": "required", "args": { "value": { "path": "/formData/email" } } },
          { "call": "required", "args": { "value": { "path": "/formData/phone" } } }
        ] } }
      ] }
    },
    "message": "You must accept terms AND provide either email or phone"
  }]
}
```

## Basic Catalog

[`basic_catalog.json`] provides the reference set. See `basic-catalog-guide.md`
for rendering guidelines per component.

### Components (18)

`Text`, `Image`, `Icon`, `Video`, `AudioPlayer`, `Row`, `Column`, `List`,
`Card`, `Tabs`, `Divider`, `Modal`, `Button`, `CheckBox`, `TextField`,
`DateTimeInput`, `ChoicePicker`, `Slider`.

### Functions (14)

- **Validation**: `required`, `regex`, `length`, `numeric`, `email`
- **Formatting**: `formatString`, `formatNumber`, `formatCurrency`,
  `formatDate`, `pluralize`
- **Logic**: `and`, `or`, `not`
- **Effects**: `openUrl`

### Theme

| Property | Type | Use |
| :--- | :--- | :--- |
| `primaryColor` | hex string (`#00BFFF`) | Brand highlight |
| `iconUrl` | URI | Agent/tool avatar shown next to the surface |
| `agentDisplayName` | string | Text identity shown next to the surface |

In multi-agent systems an orchestrator should set/verify `iconUrl` and
`agentDisplayName` so malicious sub-agents can't spoof a trusted identity.

## `formatString` String Interpolation

String interpolation works **only** inside the `formatString` function — the
spec deliberately prevents generic `${...}` in arbitrary string properties.

```json
{
  "id": "user_welcome",
  "component": "Text",
  "text": {
    "call": "formatString",
    "args": { "value": "Hello, ${/user/firstName}! Welcome back to ${/appName}." }
  }
}
```

Syntax:

- `${/absolute/path}` — absolute data binding.
- `${relative/path}` — relative (in a template scope).
- `${funcName(arg: value, arg2: ${/nested})}` — nested function calls /
  bindings; nest `${...}` deeper to keep tokenization unambiguous.
- `\${literal}` — escape a literal `${`.

## Prompt → Generate → Validate Loop

The intended runtime pattern:

1. **Prompt** — include the desired UI request, the A2UI envelope schema,
   the catalog schema, and examples.
2. **Generate** — receive raw JSON from the LLM.
3. **Validate** — schema-check against the resolved envelope + catalog. If
   invalid, return a structured `VALIDATION_FAILED` error so the LLM can
   self-correct on the next turn:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "surfaceId": "user_profile_card",
    "path": "/components/0/text",
    "message": "Expected stringOrPath, got integer"
  }
}
```

This loop is the whole point of the prompt-first redesign — the schema
provides the discipline that structured-output mode would have otherwise.

## Client-to-Server Messages

Defined in [`client_to_server.json`].

### `action`

```json
{
  "version": "v0.9",
  "action": {
    "name": "submit_form",
    "surfaceId": "contact_form_1",
    "sourceComponentId": "submit_button",
    "timestamp": "2026-01-15T12:00:00Z",
    "context": { "email": "user@example.com" }
  }
}
```

### `error`

Used to report client-side validation/runtime failures (see the
`VALIDATION_FAILED` format above).

## Capabilities (Server and Client)

v0.9 moves capabilities to **transport metadata** (no first-class A2UI
message for them).

### Server capabilities ([`server_capabilities.json`])

Declared via the transport's identity mechanism — A2A AgentCard params,
MCP server capabilities, etc. Lists `supportedCatalogIds` and
`acceptsInlineCatalogs`.

### Client capabilities ([`client_capabilities.json`])

`a2uiClientCapabilities` lives in the metadata of every client-to-server
message:

- `supportedCatalogIds` (string[], required) — IDs of catalogs the client
  ships with.
- `inlineCatalogs` (array, optional) — fully-defined catalogs supplied at
  runtime. Useful for local dev; not recommended for production.

### Client data model ([`client_data_model.json`])

When any active surface has `sendDataModel: true`, the client includes
`a2uiClientDataModel` (`{ surfaces: { <surfaceId>: <dataModel> } }`) in
metadata alongside the action.

## Transport Decoupling

v0.9 is transport-agnostic. To carry A2UI, a transport must:

1. **Deliver in order** — A2UI relies on stateful sequencing
   (`createSurface` before `updateComponents` etc.).
2. **Frame messages** — newline-delimited JSONL, WebSocket frames, SSE events.
3. **Carry metadata** — for capabilities exchange and `sendDataModel`
   payloads.
4. **(Optional)** Provide a return channel for `action` messages.

Common bindings: **A2A** (extension URI
`https://a2ui.org/a2a-extension/a2ui/v0.9`), **AG-UI**, **MCP**, **SSE+JSON-RPC**,
**WebSockets**, **REST** (no streaming). For A2A specifics see
`a2a-extension.md`.

## Full Example Stream

JSONL stream rendering a contact form:

```jsonl
{"version": "v0.9", "createSurface":{"surfaceId":"contact_form_1","catalogId":"https://a2ui.org/specification/v0_9/basic_catalog.json"}}
{"version": "v0.9", "updateComponents":{"surfaceId":"contact_form_1","components":[{"id":"root","component":"Card","child":"form_container"}, ...]}}
{"version": "v0.9", "updateDataModel":{"surfaceId":"contact_form_1","path":"/contact","value":{"firstName":"John","lastName":"Doe","email":"john.doe@example.com"}}}
{"version": "v0.9", "deleteSurface":{"surfaceId":"contact_form_1"}}
```

(See the upstream protocol doc for the complete contact-form stream with every
component — it's roughly 30 components long and demonstrates `Card`, `Row`,
`Column`, `TextField` with `checks`, `ChoicePicker`, `CheckBox`, `Button`
with `action.event.context`, `formatDate` inside a context, and more.)

[`basic_catalog.json`]: ../../../../submodules/A2UI/specification/v0_9/json/basic_catalog.json
[`client_to_server.json`]: ../../../../submodules/A2UI/specification/v0_9/json/client_to_server.json
[`server_capabilities.json`]: ../../../../submodules/A2UI/specification/v0_9/json/server_capabilities.json
[`client_capabilities.json`]: ../../../../submodules/A2UI/specification/v0_9/json/client_capabilities.json
[`client_data_model.json`]: ../../../../submodules/A2UI/specification/v0_9/json/client_data_model.json
[RFC 6901]: https://datatracker.ietf.org/doc/html/rfc6901

---

Source: `submodules/A2UI/specification/v0_9/docs/a2ui_protocol.md`.
