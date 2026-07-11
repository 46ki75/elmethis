# A2UI v1.0 Protocol Reference

A2UI v1.0 is the **release candidate** ("Candidate" status in the roadmap).
For production today, prefer v0.9.1 (the current stable release); reach for
v1.0 when you want its release-candidate features: bidirectional RPC,
`surfaceProperties`, single-message UI instantiation, and the catalog
refinements below.

v1.0 keeps v0.9's prompt-first philosophy and adjacency-list component model.
It adds a return channel from server to client (and back) on top of the
existing unidirectional rendering stream.

## Table of Contents

- [Message Types](#message-types)
- [What Changed from v0.9 / v0.9.1](#what-changed-from-v09--v091)
- [The Schema Layout](#the-schema-layout)
- [`createSurface`](#createsurface)
- [`updateComponents`](#updatecomponents)
- [`updateDataModel`](#updatedatamodel)
- [`deleteSurface`](#deletesurface)
- [`callFunction`](#callfunction)
- [`actionResponse`](#actionresponse)
- [Components and the Adjacency List Model](#components-and-the-adjacency-list-model)
- [Identifier Naming (UAX #31)](#identifier-naming-uax-31)
- [Actions](#actions)
- [Data Model: Binding and Scope](#data-model-binding-and-scope)
- [The `@index` Function](#the-index-function)
- [`formatString` String Interpolation](#formatstring-string-interpolation)
- [Functions and Validation](#functions-and-validation)
- [Client-to-Server Messages](#client-to-server-messages)
- [Capabilities and Metadata](#capabilities-and-metadata)
- [Prompt → Generate → Validate Loop](#prompt--generate--validate-loop)

## Message Types

### Server-to-client

The `server_to_client.json` envelope is a top-level `oneOf` over **six**
message types. Every message also carries a `version` field set to `"v1.0"`.

| Message | Purpose |
| :--- | :--- |
| `createSurface` | Create a surface; may inline `components` + `dataModel` |
| `updateComponents` | Add or replace components (flat list, ID references) |
| `updateDataModel` | Upsert or (with `null`) delete a value at a JSON-Pointer path |
| `deleteSurface` | Remove a surface and all its state |
| `callFunction` | Server-initiated RPC: execute a registered client function |
| `actionResponse` | Synchronous reply to a client `action` that set `wantResponse` |

### Client-to-server

The `client_to_server.json` schema permits exactly one of three top-level
keys (plus `version`):

| Message | Purpose |
| :--- | :--- |
| `action` | A user interaction; may carry `wantResponse` + `actionId` |
| `functionResponse` | Result (`value`) of a server-initiated `callFunction` |
| `error` | A client-side error (`VALIDATION_FAILED`, `INVALID_FUNCTION_CALL`, …) |

## What Changed from v0.9 / v0.9.1

See `evolution-guide.md` for the full migration. The headline changes:

- **Bidirectional RPC** — `actionResponse` (server replies to a client
  action), and `callFunction` / `functionResponse` (server invokes a client
  function and gets the result back).
- **`surfaceProperties` replaces `theme`** in `createSurface` and the catalog;
  `primaryColor` is removed (branding is deferred to the native framework).
- **Single-message UI** — `createSurface` may embed `components` and
  `dataModel` directly, so an entire UI can ship in one message.
- **Catalog `functions` is a name-keyed map** (was a list); `callableFrom`
  and `returnType` are catalog metadata only and were removed from the wire
  `FunctionCall`.
- **Catalog `instructions`** (inline Markdown) replaces the external
  `rules.txt`.
- **UAX #31 identifier naming** enforced for component, function, and argument
  names; the `@` prefix is reserved for system functions.
- **`@index`** built-in template function (optional `offset`).
- **`null`-based deletion** in `updateDataModel`; omitting keys no longer
  deletes.

## The Schema Layout

v1.0 keeps the three-schema split:

1. **`common_types.json`** — `DynamicString` / `DynamicNumber` /
   `DynamicBoolean` / `DynamicStringList`, `ChildList`, `ComponentId`,
   `CallId`, `FunctionCall`, `Action`, plus the built-in `indexSystemFunction`
   (`@index`).
2. **`server_to_client.json`** — the envelope (`oneOf` over the six message
   types). It references the catalog through a relative `catalog.json`
   placeholder (`$ref: "catalog.json#/$defs/anyComponent"` and
   `$ref: "catalog.json#/$defs/surfaceProperties"`).
3. **`catalogs/basic/catalog.json`** — the Basic Catalog: components,
   functions (a map), and the `surfaceProperties` schema.

To validate a payload, alias `catalog.json` to whichever real catalog applies.
That indirection is what makes catalogs swappable. v1.0 catalogs may also
carry standard JSON Schema metadata (`$schema`, `$id`, `title`, `description`)
without tripping `additionalProperties: false`.

## `createSurface`

Signals the client to create a surface. Once created, `surfaceId` and
`catalogId` are fixed; to change them, delete and recreate. `surfaceId` must
be globally unique for the renderer's lifetime, and it is an error to create a
surface whose ID already exists without first deleting it.

> **Note on `surfaceId` uniqueness:** v0.9.1 relaxed this to active surfaces
> only, but the v1.0 protocol restored the stronger "globally unique for the
> renderer's lifetime" wording. Orchestrators are expected to namespace IDs
> (e.g. prefix a subagent name, or require UUIDs) to avoid collisions.

**Properties:**

- `surfaceId` (string, required) — globally unique for the renderer's lifetime.
- `catalogId` (string, required) — identifier of the catalog. Recommended to
  prefix with a domain you own; the URI is purely an identifier, not fetched.
- `surfaceProperties` (object, optional) — values for the catalog's
  `surfaceProperties` schema (e.g. `agentDisplayName`, `iconUrl`). **Replaces
  the v0.9 `theme` object.**
- `sendDataModel` (boolean, optional, default `false`) — if `true`, the client
  attaches the surface's full data model to the metadata of every message it
  sends to the surface owner.
- `components` (array, optional) — inline UI components, built immediately on
  creation. Conforms to `ComponentsList`. **New in v1.0.**
- `dataModel` (object, optional) — the initial root data model. **New in v1.0.**

Exactly one component in the resulting tree must have id `root`.

```json
{
  "version": "v1.0",
  "createSurface": {
    "surfaceId": "user_profile_card",
    "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
    "surfaceProperties": { "agentDisplayName": "Weather Bot" },
    "sendDataModel": true,
    "components": [
      { "id": "root", "component": "Column", "children": ["user_name"] },
      { "id": "user_name", "component": "Text", "text": { "path": "/name" } }
    ],
    "dataModel": { "name": "John Doe" }
  }
}
```

## `updateComponents`

A flat list of components; parents reference children by id. Components may
arrive in any order and may reference children that don't yet exist — clients
render progressively and fill in as definitions arrive.

```json
{
  "version": "v1.0",
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

## `updateDataModel`

Upserts at a JSON Pointer path. **Deletion is explicit via `null`** — omitting
keys no longer deletes them.

- If the path exists, the value is updated.
- If the path does not exist, it is created.
- If the `value` is `null`, the key at that path is removed.
- If `path` is omitted (or `/`), the whole model is replaced.

```json
{
  "version": "v1.0",
  "updateDataModel": {
    "surfaceId": "user_profile_card",
    "path": "/user/name",
    "value": "Jane Doe"
  }
}
```

Remove a field by setting it to `null`:

```json
{
  "version": "v1.0",
  "updateDataModel": { "surfaceId": "user_profile_card", "path": "/user/tempData", "value": null }
}
```

## `deleteSurface`

```json
{ "version": "v1.0", "deleteSurface": { "surfaceId": "user_profile_card" } }
```

## `callFunction`

Server-initiated RPC: the server asks the client to execute a function
registered in the active catalog. This avoids sending executable code on the
wire.

**Properties:**

- `version` (`"v1.0"`, required).
- `functionCallId` (`CallId`, required) — unique per invocation; the client
  MUST copy it verbatim into its `functionResponse` or `error`.
- `wantResponse` (boolean, optional, default `false`) — if `true`, the client
  MUST reply with a `functionResponse` or an `error`.
- `callFunction` (object, required) — `{ "call": <name>, "args": { … } }`.

```json
{
  "version": "v1.0",
  "functionCallId": "get_device_resolution_123",
  "wantResponse": true,
  "callFunction": { "call": "getScreenResolution", "args": { "screenIndex": 0 } }
}
```

**Execution boundaries** are enforced at runtime by the client, not on the
wire. The client looks up the function's `callableFrom` metadata in its active
catalog (`clientOnly` / `remoteOnly` / `clientOrRemote`; defaults to
`clientOnly` if omitted). If a remote `callFunction` targets a `clientOnly`
function, or an unregistered function, the client MUST reject it with an
`error` whose `code` is `INVALID_FUNCTION_CALL`.

## `actionResponse`

The server's synchronous reply to a client `action` that set
`wantResponse: true`. The client matches it by `actionId`.

**Properties:**

- `version` (`"v1.0"`, required).
- `actionId` (string, required) — matches the client's `action.actionId`.
- `actionResponse` (object, required) — exactly one of:
  - `value` (any) — the success return value.
  - `error` (object) — `{ "code": <string>, "message": <string> }`.

```json
{
  "version": "v1.0",
  "actionId": "get_typeahead_suggestions_1",
  "actionResponse": { "value": ["apple", "application", "approved"] }
}
```

If the originating `action.event` set a `responsePath`, the client writes the
returned `value` into its local data model at that JSON Pointer.

## Components and the Adjacency List Model

A component object is `{ "id": <ComponentId>, "component": <type>, …props }`.
The UI is a flat list; parents reference children by id, the client stores
them in a `Map<id, Component>` and builds the tree at render time. Rendering
begins once a component with id `root` exists; updates before that are
buffered. This is unchanged from v0.9.

`anyComponent` in the catalog uses a `discriminator` on `component` so a
JSON-Schema validator can route each object to the right component schema.

## Identifier Naming (UAX #31)

In v1.0, all catalog entity names — **component names, function names, and
argument/property keys** — MUST conform to Unicode Standard Annex #31:

- Begin with `XID_Start` or underscore (`_`); never a digit.
- Continue with `XID_Continue`.
- No whitespace or `Pattern_Syntax` symbols (other than `_`).

Canonical regex: `^[\p{XID_Start}_][\p{XID_Continue}]*$`

Valid: `UserProfileCard`, `submit_form`, `item_id_1`, `_internal_state`.
Invalid: `User Card`, `1stItem`, `submit-form`, `user#name`.

The `@` prefix is **reserved** for system functions (e.g. `@index`); custom
catalogs MUST NOT define `@`-prefixed functions.

## Actions

Interactive components use an `action` object — either a server event or a
local function call.

### Server action

```json
{
  "component": "Button",
  "text": "Submit",
  "action": {
    "event": {
      "name": "submit_form",
      "context": { "itemId": "123" },
      "wantResponse": false,
      "responsePath": "/lastResult"
    }
  }
}
```

- `wantResponse` (boolean, optional) — if `true`, the client generates an
  `actionId`, sends it on the `action`, and expects an `actionResponse`.
- `responsePath` (string, optional) — JSON Pointer where the client saves the
  returned `value`.

### Local action

```json
{
  "component": "Button",
  "text": "Open Link",
  "action": { "functionCall": { "call": "openUrl", "args": { "url": "${/url}" } } }
}
```

## Data Model: Binding and Scope

Bindings use JSON Pointer ([RFC 6901]). Paths starting with `/` are absolute
(resolve from the data-model root). Inside a `ChildList` template (a container
whose `children` is `{ componentId, path }`), each item creates a child scope:
a path **without** a leading `/` is relative to the current item
(`firstName` → `/users/0/firstName`, …), while a leading-`/` path still
escapes to root. Type coercion when interpolating non-strings: numbers /
booleans use their standard representation, `null`/`undefined` become `""`,
and objects / arrays are JSON-stringified.

Two-way binding for inputs (`TextField`, `CheckBox`, `Slider`, `ChoicePicker`,
`DateTimeInput`) is local to the client: edits write immediately to the local
data model but only reach the server on an `action` (or via `sendDataModel`).

## The `@index` Function

`@index` returns the 0-based index of the current item during list-template
rendering. It is a universal system function (available in every catalog) and
MUST only be evaluated inside a collection scope; calling it in the root scope
is an evaluation error.

- `offset` (number, optional, default `0`) — added to the index, e.g.
  `@index(offset: 1)` yields 1-based numbering.

```json
{
  "id": "todo_index",
  "component": "Text",
  "text": { "call": "formatString", "args": { "value": "#${@index(offset: 1)}" } }
}
```

## `formatString` String Interpolation

`${...}` interpolation is valid **only** inside the `formatString` function.

- `${/absolute/path}` / `${relative/path}` — data bindings.
- `${func(arg: value, arg2: ${/nested})}` — function calls (identified by
  `()`); nest `${...}` for explicit binding or chaining.
- `\${literal}` — escape a literal `${`.

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

## Functions and Validation

Functions are referenced by name via a `FunctionCall` object and defined in
the active catalog. Input components and buttons can carry `checks` — function
calls returning a boolean, each with a `message`. A failing button check
disables the button.

```json
"checks": [
  { "call": "required", "args": { "value": { "path": "/formData/zip" } }, "message": "Zip code is required" },
  { "call": "regex", "args": { "value": { "path": "/formData/zip" }, "pattern": "^[0-9]{5}$" }, "message": "Must be a 5-digit zip code" }
]
```

In v1.0 the catalog `functions` field is a **map** keyed by function name (see
`custom-functions.md`). The wire `FunctionCall` carries only `call` and `args`
— `callableFrom` and `returnType` live in the catalog as metadata.

## Client-to-Server Messages

### `action`

```json
{
  "version": "v1.0",
  "action": {
    "name": "submitForm",
    "surfaceId": "contact_form_1",
    "sourceComponentId": "submit_button",
    "timestamp": "2026-06-02T08:57:23Z",
    "context": { "isSubscribed": true },
    "wantResponse": true,
    "actionId": "form_submit_773"
  }
}
```

`actionId` is REQUIRED when `wantResponse` is `true`; otherwise optional.

### `functionResponse`

Returned for a server `callFunction` that set `wantResponse: true`.

```json
{
  "version": "v1.0",
  "functionResponse": {
    "functionCallId": "get_device_resolution_123",
    "call": "getScreenResolution",
    "value": [1920, 1080]
  }
}
```

`functionCallId` and `call` are copied verbatim from the server message.

### `error`

Reports a client-side error. `code` and `message` are required.
`surfaceId` and `functionCallId` are **mutually exclusive**: include
`surfaceId` for surface/validation errors, `functionCallId` for function
execution failures.

```json
{
  "version": "v1.0",
  "error": {
    "code": "INVALID_FUNCTION_CALL",
    "message": "Function 'deleteLocalFile' is clientOnly and cannot be called from the server.",
    "functionCallId": "delete_file_call_9"
  }
}
```

A `VALIDATION_FAILED` error instead carries `surfaceId` and `path` (see the
loop below).

## Capabilities and Metadata

Capabilities ride in transport metadata, not in first-class A2UI messages.
Both schemas key their structure under a `v1.0` object.

- **Server** (`server_capabilities.json`) — `supportedCatalogIds`
  (string[], required) and `acceptsInlineCatalogs` (boolean, default `false`).
  Advertised via the transport identity mechanism (A2A AgentCard params, MCP
  server capabilities, …).
- **Client** (`client_capabilities.json`) — `a2uiClientCapabilities` with
  `supportedCatalogIds` and optional `inlineCatalogs`. Functions inside inline
  catalogs may declare `callableFrom` to advertise execution boundaries.
- **Client data model** (`client_data_model.json`) — when `sendDataModel` is
  on, `a2uiClientDataModel` is `{ "version": "v1.0", "surfaces": { <id>: <model> } }`.

## Prompt → Generate → Validate Loop

The intended runtime pattern is unchanged from v0.9: prompt the LLM with the
desired UI plus the envelope + catalog schemas; generate JSON; validate it
against the resolved schema and return a structured error so the LLM can
self-correct.

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

[RFC 6901]: https://datatracker.ietf.org/doc/html/rfc6901

---

Source: `specification/v1_0/docs/a2ui_protocol.md` in `a2ui-project/a2ui`.
