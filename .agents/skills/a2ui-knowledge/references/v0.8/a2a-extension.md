# A2UI v0.8 — A2A Extension

This document describes how A2UI v0.8 is advertised and transported over the
A2A (Agent-to-Agent) protocol. Use it whenever you need to wire A2UI messages
through A2A transport — Agent Card declaration, extension activation, or
DataPart encoding.

## Extension URI

```text
https://a2ui.org/a2a-extension/a2ui/v0.8
```

This is the **only** URI accepted for the v0.8 extension. Anything else is
non-conformant.

## Core concepts

- **Surfaces** — distinct, independently controllable UI regions identified by
  `surfaceId`. A single agent stream can drive many surfaces simultaneously
  (e.g. a chat bubble plus a sticky side panel).
- **Catalog Definition Document** — the extension is component-agnostic. All
  component types and styles live in a separate catalog schema, which client
  and server negotiate per session.
- **Client capabilities** — the client declares its supported catalogs in an
  `a2uiClientCapabilities` object inside the `metadata` field of **every** A2A
  `Message` it sends.

The extension is defined by three primary JSON schemas:

1. **Catalog Definition Schema** — describes the available components and
   styles.
2. **Server-to-Client Message Schema** — wire format for `surfaceUpdate`,
   `dataModelUpdate`, `beginRendering`, `deleteSurface`.
3. **Client-to-Server Event Schema** — wire format for `userAction` and
   `error`.

## Agent Card declaration

Agents advertise A2UI support inside `AgentCapabilities.extensions`. The
`params` object carries the agent's specific capability flags.

```json
{
  "uri": "https://a2ui.org/a2a-extension/a2ui/v0.8",
  "description": "Ability to render A2UI",
  "required": false,
  "params": {
    "supportedCatalogIds": [
      "https://a2ui.org/specification/v0_8/standard_catalog_definition.json",
      "https://my-company.com/a2ui/v0.8/my_custom_catalog.json"
    ],
    "acceptsInlineCatalogs": true
  }
}
```

### Parameters

| Param | Type | Required | Meaning |
| :--- | :--- | :--- | :--- |
| `supportedCatalogIds` | `string[]` | optional | URIs of catalog definition schemas the agent can generate UI for. |
| `acceptsInlineCatalogs` | `boolean` | optional, default `false` | Whether the agent can accept `inlineCatalogs` sent in the client's `a2uiClientCapabilities`. |

`supportedCatalogIds` is a **soft signal**, not a strict contract — an
orchestrating agent may dynamically delegate to subagents that support
catalogs the orchestrator never advertised. Clients should treat the
advertised list as a subset of true support.

## Extension activation

Clients activate the extension via A2A's standard transport-defined activation:

- **JSON-RPC / HTTP**: `X-A2A-Extensions` HTTP header.
- **gRPC**: `X-A2A-Extensions` metadata value.

Activating the extension means the server may emit A2UI messages
(e.g. `surfaceUpdate`) and the client is expected to send A2UI events
(e.g. `userAction`) back.

## Data encoding

A2UI messages travel as an A2A `DataPart`. The `DataPart` must carry the
mimeType marker identifying it as A2UI content:

- `metadata.mimeType` = `application/json+a2ui`

The `data` field holds the A2UI JSON message itself (e.g. `surfaceUpdate`,
`userAction`).

> **MIME type note:** v0.8 used the legacy `application/json+a2ui` spelling
> (shown below for historical accuracy). The MIME type was later standardized
> to `application/a2ui+json` in v0.9.1; use that form for any current
> (v0.9.1 / v1.0) deployment.

### Example DataPart

```json
{
  "data": {
    "beginRendering": {
      "surfaceId": "outlier_stores_map_surface"
    }
  },
  "kind": "data",
  "metadata": {
    "mimeType": "application/json+a2ui"
  }
}
```

## Client capabilities in message metadata

Independently of the Agent Card, the client must inject its capabilities into
the metadata of every outbound A2A `Message`:

```json
{
  "metadata": {
    "a2uiClientCapabilities": {
      "supportedCatalogIds": [
        "https://a2ui.org/specification/v0_8/standard_catalog_definition.json"
      ],
      "inlineCatalogs": []
    }
  }
}
```

The agent inspects this on every request to decide which catalog to use when
emitting `beginRendering`. See `custom-catalog.md` for the full negotiation
flow and implementation guidance for both agent and renderer libraries.

---

Source: `submodules/A2UI/specification/v0_8/docs/a2ui_extension_specification.md`.
