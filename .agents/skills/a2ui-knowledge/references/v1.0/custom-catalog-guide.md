# A2UI v1.0 — Custom Catalog Guide

The end-to-end workflow for defining a custom catalog — the negotiation
handshake, versioning, two-phase validation, graceful degradation, security,
and agent-side ADK integration — is the same as v0.9. Read
`references/v0.9/custom-catalog-guide.md` for that workflow. This guide covers
the **v1.0 catalog-schema changes** you must apply.

## v1.0 Catalog Schema Changes

### `functions` is a map, not a list

In v1.0 the catalog `functions` field is an **object keyed by function name**,
where each value is a `FunctionDefinition`. This gives O(1) lookup and matches
how `components` is already keyed.

```json
{
  "catalogId": "https://my-company.com/a2ui/v1_0/catalog.json",
  "functions": {
    "trim": {
      "returnType": "string",
      "callableFrom": "clientOrRemote",
      "properties": { "call": { "const": "trim" }, "args": { "...": "..." } },
      "required": ["call", "args"]
    }
  }
}
```

### `callableFrom` and `returnType` are catalog metadata

Each `FunctionDefinition` carries:

- `returnType` (required) — `string` / `number` / `boolean` / `array` /
  `object` / `any` / `void`.
- `callableFrom` (optional, default `clientOnly`) — `clientOnly` /
  `remoteOnly` / `clientOrRemote`. Governs whether the server may invoke the
  function via `callFunction`.

These live **only** in the catalog/capabilities metadata. They are **removed
from the wire `FunctionCall`**, so do not emit them in streamed messages. The
client enforces `callableFrom` at runtime, rejecting invalid remote calls with
`INVALID_FUNCTION_CALL`. See `custom-functions.md`.

### `theme` → `surfaceProperties`

Rename the `$defs/theme` definition to `$defs/surfaceProperties` and remove
`primaryColor`. The envelope references it as
`$ref: "catalog.json#/$defs/surfaceProperties"`. `surfaceProperties` typically
uses `additionalProperties: true` so you can add app-specific surface fields.

### Inline `instructions` replaces `rules.txt`

Add an optional top-level `instructions` field (Markdown string) to embed
design guidelines and component usage rules directly in the catalog. This
replaces the external `rules.txt` prompt fragment used in v0.9.

```json
{
  "catalogId": "https://my-company.com/a2ui/v1_0/catalog.json",
  "instructions": "Use Row and Column for layout. Buttons MUST define an action.",
  "components": { "...": "..." },
  "functions": { "...": "..." }
}
```

### Standard JSON Schema metadata is allowed

`$schema`, `$id`, `title`, and `description` are now permitted on the catalog
object even though it uses `additionalProperties: false`. This lets inline
catalogs carry standard schema metadata without failing validation.

### UAX #31 identifier naming

All component names, function names, and argument/property keys MUST conform to
Unicode Standard Annex #31:

- Begin with `XID_Start` or `_`; never a digit.
- Continue with `XID_Continue`.
- No whitespace or `Pattern_Syntax` symbols (other than `_`).

Canonical regex: `^[\p{XID_Start}_][\p{XID_Continue}]*$`. The `@` prefix is
reserved for system functions (e.g. `@index`) — custom catalogs MUST NOT define
`@`-prefixed names.

## Validator-Compliance Rules (unchanged)

As in v0.9, so automated validators can verify the component tree:

- Any property holding another component's id MUST use
  `$ref: "common_types.json#/$defs/ComponentId"` — not raw `"type": "string"`.
- Any list of children or template MUST use
  `$ref: "common_types.json#/$defs/ChildList"`.

The envelope references the catalog through the relative `catalog.json`
placeholder (`$ref: "catalog.json#/$defs/anyComponent"` and
`$ref: "catalog.json#/$defs/surfaceProperties"`); alias it to your real catalog
to validate. Ship production catalogs freestanding (no external `$ref`s).

## Negotiation, Versioning, Degradation, Security, ADK

These are unchanged from v0.9 — see `references/v0.9/custom-catalog-guide.md`:

- **Negotiation** — `supportedCatalogIds`, `acceptsInlineCatalogs`,
  client-supplied `inlineCatalogs` in `a2uiClientCapabilities`.
- **Versioning** — embed a version in `catalogId`; treat removed/renamed
  components or props as breaking.
- **Two-phase validation** — structural (envelope) then semantic (catalog).
- **Graceful degradation** — render placeholders for unknown components and
  report a `VALIDATION_FAILED` error so the agent can self-correct.
- **Security** — only registered components render; an orchestrator should
  set/verify `surfaceProperties` identity fields.
- **Agent-side ADK integration** — `A2uiSchemaManager`,
  `SendA2uiToClientToolset`, `A2uiEventConverter`.

---

Source: `specification/v1_0/json/client_capabilities.json`,
`specification/v1_0/catalogs/basic/catalog.json`, and
`specification/v1_0/docs/a2ui_protocol.md` in `a2ui-project/a2ui`.
