# A2UI v1.0 — A2A Extension

How A2UI v1.0 is advertised and transported over the A2A (Agent-to-Agent)
protocol. The shape matches v0.9 / v0.9.1: a per-version URI, a `data` field
carrying a **list** of messages, and capabilities referencing the
`server_capabilities.json` / `client_capabilities.json` schemas. The MIME type
is the standardized `application/a2ui+json`.

## Extension URI

```text
https://a2ui.org/a2a-extension/a2ui/v1.0
```

This is the only URI accepted for the v1.0 extension.

## Core concepts

- **Surfaces** — independently controllable UI regions identified by
  `surfaceId`. A single agent can manage many in parallel.
- **Catalog Definition Document** — components, functions, and the
  `surfaceProperties` schema live in a catalog the client and server agree on
  per session.
- **Capabilities exchange** — agents advertise capabilities via Agent Card
  `params` (matching `server_capabilities.json`); clients reply via
  `a2uiClientCapabilities` in message metadata (matching
  `client_capabilities.json`).

Primary schemas backing the extension:

| Schema | Purpose |
| :--- | :--- |
| Catalog Definition | A library of components, functions, and a `surfaceProperties` schema |
| Server-to-Client Message List | Wire format for `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`, `callFunction`, `actionResponse` |
| Client-to-Server Message List | Wire format for `action`, `functionResponse`, `error` |
| Server Capabilities | `a2uiServerCapabilities` (UI generation capabilities) |
| Client Capabilities | `a2uiClientCapabilities` (supported catalogs + inline catalogs) |

## Agent Card declaration

Inside `AgentCapabilities.extensions`:

```json
{
  "uri": "https://a2ui.org/a2a-extension/a2ui/v1.0",
  "description": "Ability to render A2UI v1.0",
  "required": false,
  "params": {
    "supportedCatalogIds": [
      "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
      "https://my-company.com/a2ui/v0_1/my_custom_catalog.json"
    ],
    "acceptsInlineCatalogs": true
  }
}
```

### Parameters

| Param | Type | Required | Meaning |
| :--- | :--- | :--- | :--- |
| `supportedCatalogIds` | `string[]` | optional | IDs of catalogs the agent can generate UI for. Not necessarily resolvable URIs — just stable identifiers. |
| `acceptsInlineCatalogs` | `boolean` | optional, default `false` | Whether the agent can use catalogs the client supplies at runtime via `a2uiClientCapabilities.inlineCatalogs`. |

The `params` object corresponds directly to the `v1.0` object in
`server_capabilities.json`.

## Extension activation

Clients activate the extension via the standard A2A activation mechanism:

- **JSON-RPC / HTTP**: `X-A2A-Extensions` HTTP header.
- **gRPC**: `X-A2A-Extensions` metadata value.

Activating the extension means the agent may emit A2UI server messages (e.g.
`createSurface`, `callFunction`) and the client is expected to send A2UI client
messages (e.g. `action`, `functionResponse`) back.

## Data encoding — list semantics

A2UI v1.0 messages travel as an A2A `DataPart`:

- `metadata.mimeType` = `application/a2ui+json`
- `data` is an **array of A2UI messages**, not a single message.

```json
{
  "data": [
    {
      "version": "v1.0",
      "createSurface": {
        "surfaceId": "example_surface",
        "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json"
      }
    },
    {
      "version": "v1.0",
      "updateComponents": {
        "surfaceId": "example_surface",
        "components": [{ "component": "Text", "id": "root", "text": "Hello!" }]
      }
    }
  ],
  "kind": "data",
  "metadata": { "mimeType": "application/a2ui+json" }
}
```

### Processing rules

The message list is **not transactional**. Receivers (both clients and
agents) must:

- process messages **sequentially**,
- if any individual message fails to validate or apply, log/report the error
  for that message but **continue** processing the rest,
- treat atomicity as a per-message property only.

However, **renderers should not repaint until the whole list is processed** —
that avoids flashing intermediate states across a batch update.

## Client-to-server events

The same DataPart format, but `data` validates against the Client-to-Server
Message List Schema (`client_to_server.json`):

```json
{
  "data": [{
    "version": "v1.0",
    "action": {
      "name": "submit_form",
      "surfaceId": "contact_form_1",
      "sourceComponentId": "submit_button",
      "timestamp": "2026-01-15T12:00:00Z",
      "context": { "email": "user@example.com" }
    }
  }],
  "kind": "data",
  "metadata": { "mimeType": "application/a2ui+json" }
}
```

## Metadata fields

Two A2UI-defined objects ride in A2A `Message.metadata`:

| Field | Schema | When |
| :--- | :--- | :--- |
| `a2uiClientCapabilities` | `client_capabilities.json` | every client → server message |
| `a2uiClientDataModel` | `client_data_model.json` | client → server, when an active surface was created with `sendDataModel: true` |

## Context mapping

A2UI sessions typically map to an A2A `contextId`. Messages for a set of
related surfaces should share the same `contextId`.

---

Source: `specification/v1_0/docs/a2ui_extension_specification.md` in
`a2ui-project/a2ui`.
