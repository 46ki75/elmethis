# A2UI v0.9 — A2A Extension

This document describes how A2UI v0.9 is advertised and transported over the
A2A (Agent-to-Agent) protocol. The shape is similar to v0.8 with three
notable changes: a new URI, the `data` field now carries a **list** of
messages, and capabilities now reference the `server_capabilities.json` /
`client_capabilities.json` schemas.

## Extension URI

```text
https://a2ui.org/a2a-extension/a2ui/v0.9
```

This is the only URI accepted for the v0.9 extension.

## Core concepts

- **Surfaces** — independently controllable UI regions identified by
  `surfaceId`. A single agent can manage many in parallel.
- **Catalog Definition Document** — components, functions, and theme schema
  live in a catalog the client and server agree on per session.
- **Capabilities exchange** — agents advertise capabilities via Agent Card
  `params` (matching `server_capabilities.json`), clients reply via
  `a2uiClientCapabilities` in message metadata (matching
  `client_capabilities.json`).

Five primary schemas back the extension:

| Schema | Purpose |
| :--- | :--- |
| Catalog Definition | A library of components, functions, and a theme schema |
| Server-to-Client Message List | Wire format for `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface` |
| Client-to-Server Message List | Wire format for `action` and `error` |
| Server Capabilities | `a2uiServerCapabilities` (UI generation capabilities) |
| Client Capabilities | `a2uiClientCapabilities` (supported catalogs + inline catalogs) |

## Agent Card declaration

Inside `AgentCapabilities.extensions`:

```json
{
  "uri": "https://a2ui.org/a2a-extension/a2ui/v0.9",
  "description": "Ability to render A2UI v0.9",
  "required": false,
  "params": {
    "supportedCatalogIds": [
      "https://a2ui.org/specification/v0_9/basic_catalog.json",
      "https://my-company.com/a2ui/v0.9/my_custom_catalog.json"
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

The `params` object corresponds directly to the `v0.9` object in
`server_capabilities.json`. Treat the advertised list as a soft signal —
orchestrators may delegate to sub-agents whose catalogs aren't in the
parent's advertisement.

## Extension activation

Clients activate the extension via the standard A2A activation mechanism:

- **JSON-RPC / HTTP**: `X-A2A-Extensions` HTTP header.
- **gRPC**: `X-A2A-Extensions` metadata value.

Activating the extension means the agent may emit A2UI server messages
(e.g. `createSurface`) and the client is expected to send A2UI client
messages (e.g. `action`) back.

## Data encoding — list semantics

A2UI v0.9 messages travel as an A2A `DataPart`:

- `metadata.mimeType` = `application/a2ui+json`
- `data` is an **array of A2UI messages**, not a single message.

> **MIME type note:** v0.9.1 standardized the payload MIME type to
> `application/a2ui+json` (the form shown throughout this document). Early
> v0.9 draft material used the legacy `application/json+a2ui`; update any
> hardcoded references to the current spelling. Message names and structure
> are otherwise identical between v0.9 and v0.9.1.

```json
{
  "data": [
    {
      "version": "v0.9",
      "createSurface": {
        "surfaceId": "example_surface",
        "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"
      }
    },
    {
      "version": "v0.9",
      "updateComponents": {
        "surfaceId": "example_surface",
        "components": [{ "id": "root", "component": "Text", "text": "Hello!" }]
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
- if any individual message fails to validate or apply, log/report the
  error for that message but **continue** processing the rest,
- treat atomicity as a per-message property only.

However, **renderers should not repaint until the whole list is processed**
— that avoids flashing intermediate states across a batch update.

## Client-to-server messages

The same DataPart format, but `data` validates against the Client-to-Server
Message List Schema (`client_to_server.json`):

```json
{
  "data": [{
    "version": "v0.9",
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
| `a2uiClientDataModel` | `client_data_model.json` | client → server messages, when at least one active surface was created with `sendDataModel: true` |

See `custom-catalog-guide.md` for the catalog-negotiation flow and
`protocol.md` for the data-sync semantics.

## Context mapping

A2UI sessions typically map to an A2A `contextId`. Messages for a set of
related surfaces should share the same `contextId`.

---

Source: `submodules/A2UI/specification/v0_9/docs/a2ui_extension_specification.md`.
