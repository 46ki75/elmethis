# A2UI v0.8 — Custom Catalog Negotiation

v0.8 introduced a per-request capability handshake that replaces the older
one-shot `clientUiCapabilities` message. Use this reference whenever you are
implementing the agent or renderer side of catalog negotiation, building a
custom catalog, or supporting `inlineCatalogs` for local development.

## Why the change

The earlier `clientUiCapabilities` message was a single, one-time declaration.
The v0.8 mechanism:

- runs **on every request**, so capabilities can vary per call,
- lets a single client advertise **multiple** pre-compiled catalogs,
- allows the agent to pick the **right catalog per surface**,
- supports `inlineCatalogs` so a client can ship a fresh catalog definition
  at runtime (useful in local dev where you don't want to bake the catalog
  into the agent).

## Key protocol changes

### 1. Agent advertises capabilities

Inside the A2UI extension block of the Agent Card:

- `supportedCatalogIds` — URIs of catalogs the agent can generate UI for.
- `acceptsInlineCatalogs` — `true` if the agent can process catalogs the
  client supplies at runtime.

See `a2a-extension.md` for the full Agent Card schema.

### 2. Client capabilities ride in A2A message metadata

`a2uiClientCapabilities` is **no longer a standalone message** — it lives in
the `metadata` field of **every** A2A `Message` the client sends:

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

- `supportedCatalogIds` (required) — IDs of pre-compiled catalogs.
- `inlineCatalogs` (optional) — array of complete catalog definition documents.

Schema: `specification/v0_8/json/a2ui_client_capabilities_schema.json`.

### 3. Per-surface catalog selection on `beginRendering`

The agent declares which catalog applies to each surface:

```json
{
  "beginRendering": {
    "surfaceId": "s1",
    "catalogId": "https://my-company.com/.../catalog.json",
    "root": "root"
  }
}
```

If `catalogId` is omitted, the client **MUST** default to the v0.8 standard
catalog (`https://a2ui.org/specification/v0_8/standard_catalog_definition.json`).

Schema: `specification/v0_8/json/server_to_client.json`.

### 4. Catalogs carry their own `catalogId`

The Catalog Definition Schema now requires a top-level `catalogId` field, so
inline catalogs are self-identifying.

Schema: `specification/v0_8/json/catalog_description_schema.json`.

## Implementation guide — Agent (server) developers

Your job is to parse client capabilities and choose a catalog per surface.

1. **Advertise capability** — in your Agent Card, declare
   `supportedCatalogIds` and `acceptsInlineCatalogs: true` (if applicable)
   inside the A2UI extension block.
2. **Parse capabilities on every request** — read
   `metadata.a2uiClientCapabilities` from each incoming A2A message to learn
   what catalogs this client supports.
3. **Choose a catalog** — for each surface you intend to render, pick a catalog
   the client advertised (either via `supportedCatalogIds` or `inlineCatalogs`).
4. **Specify the catalog on render** — set `catalogId` on the corresponding
   `beginRendering` message. Omitting it implicitly requests the standard
   catalog.
5. **Generate compliant UI** — every component in subsequent `surfaceUpdate`
   messages must conform to the property schema of the chosen catalog.

Recommended workflow: resolve `server_to_client.json` against the chosen
catalog at build time, and feed the resolved schema to the LLM as structured
output, so the model only emits valid components and styles.

## Implementation guide — Renderer (client) developers

Your job is to declare capabilities and render each surface using the catalog
the agent picked.

1. **Inject capabilities on every request** — every outbound A2A message must
   include `metadata.a2uiClientCapabilities`.
2. **Populate `supportedCatalogIds`** — list every pre-compiled catalog you
   support. Include the standard catalog ID explicitly if you support it:
   `https://a2ui.org/specification/v0_8/standard_catalog_definition.json`.
3. **(Optional) provide `inlineCatalogs`** — full catalog definitions you
   generated or loaded at runtime. The agent must have advertised
   `acceptsInlineCatalogs: true` for this to be honored.
4. **Process `beginRendering.catalogId`** — when it arrives, look the catalog
   up by ID:
   - present → render the surface against that catalog,
   - absent  → default to the v0.8 standard catalog.
5. **Handle multiple catalogs in parallel** — different surfaces may use
   different catalogs simultaneously. A `Map<surfaceId, catalog>` is the
   common pattern.

## Security note

Pre-compile your supported catalogs into the client — do **not** fetch them
at runtime. The spec calls this out explicitly: runtime catalog fetching
opens a prompt-injection vector by letting external content reshape the
agent's structured-output schema. `inlineCatalogs` are intended for local
development workflows only.

---

Source: `submodules/A2UI/specification/v0_8/docs/custom_catalog_changes.md`
(supplemented by the negotiation section of
`submodules/A2UI/specification/v0_8/docs/a2ui_protocol.md`).
