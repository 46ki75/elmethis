# A2UI Evolution Guide — v0.8.1 → v0.9

Use this reference when migrating an existing v0.8 implementation, or when
deciding which version to target for a new project.

## Why v0.9 exists

v0.8 was optimized for **structured output** — strict JSON mode or function
calling. It relied on key-wrapped components and adjacency-list maps that
schema validators could pin down precisely but that LLMs found awkward to
generate.

v0.9 is **prompt-first** — the schema is meant to be embedded directly in
the model's system prompt and the model is expected to produce JSON that
matches by example. That gives:

1. **Richer schemas** — no longer constrained by what structured-output
   modes accept. Catalogs can be more expressive and more readable.
2. **Modular schemas** — split into `common_types.json`, `server_to_client.json`,
   `basic_catalog.json` (plus capability schemas), making custom catalogs easy.

The trade-off: the LLM is no longer **strictly** constrained by the schema,
so v0.9 requires robust post-generation validation and a retry/correct
loop. That loop is built in via the `VALIDATION_FAILED` error format.

## Summary table

| Feature | v0.8.1 | v0.9 |
| :--- | :--- | :--- |
| Philosophy | Structured Output / Function Calling | Prompt-First / In-Context Schema |
| Message types | `beginRendering`, `surfaceUpdate`, `dataModelUpdate`, `deleteSurface` | `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface` |
| Surface creation | `beginRendering` (also flags ready-to-render) | `createSurface` (separate creation + render-when-ready-via-root) |
| Component shape | Key-based wrapper `{"Text": {...}}` | Property discriminator `"component": "Text"` |
| Data model update | Array of typed key-value entries | Standard JSON object at `path` |
| Data binding | `dataBinding` / `literalString` typed wrappers | `path` / native JSON types |
| Button context | Array of key-value pairs | Standard JSON object |
| Button variant | Boolean `primary: true` | Enum `variant: "primary" \| "borderless"` |
| Catalog | Separate component + function catalogs | Unified catalog (`basic_catalog.json`) |
| Auxiliary rules | (none) | `basic_catalog_rules.txt` prompt fragment |
| Validation | Schema-only | `ValidationFailed` feedback loop |
| Data sync | Ad-hoc | Explicit `sendDataModel` flag |

## Architectural & schema changes

### Modular schema layout

v0.8.1 had a monolithic `server_to_client.json`. v0.9 splits into:

- `common_types.json` — `DynamicString`, `DynamicNumber`, `DynamicBoolean`,
  `DynamicStringList`, `ChildList`, `ComponentId`, `FunctionCall`.
- `server_to_client.json` — the envelope (top-level `oneOf` over the four
  message types).
- `basic_catalog.json` — unified components + functions + theme.

The envelope references the catalog via a relative `catalog.json` placeholder
(`$ref: "catalog.json#/$defs/anyComponent"`), so validators can alias it to
`basic_catalog.json` or any custom catalog without modifying the envelope.

### Strict message typing

v0.8.1 relied on `minProperties: 1` over optional keys. v0.9 uses a
top-level `oneOf` constraint — natural for both LLMs and human readers.

### Auxiliary rules file

v0.9 ships a new artifact: `basic_catalog_rules.txt`, a plain-text prompt
fragment for rules that are awkward to express in JSON Schema (e.g.,
"`Button` MUST provide `action`"). Designed to be appended to the system
prompt alongside the catalog.

## Protocol lifecycle changes

### `beginRendering` → `createSurface`

v0.8.1: `beginRendering` was a render-now signal carrying `root` and
optional `styles`.

v0.9: `createSurface` creates the surface. The render trigger is no longer
explicit — clients render as soon as a valid tree with id `root` exists.
`createSurface` carries `theme` (instead of `styles`) and requires
`catalogId`.

v0.8.1 example → v0.9 equivalent:

```json
// v0.8.1
{ "beginRendering": { "surfaceId": "card", "root": "root",
                      "styles": { "primaryColor": "#007bff" } } }

// v0.9
{ "version": "v0.9",
  "createSurface": { "surfaceId": "card",
                     "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
                     "theme": { "primaryColor": "#007bff" } } }
```

## Message-structure comparison

### Component updates

v0.8.1 wrapped components by type name:

```json
{ "id": "title", "component": { "Text": { "text": { "literalString": "Hello" } } } }
```

v0.9 flattens with a discriminator:

```json
{ "id": "title", "component": "Text", "text": "Hello" }
```

LLMs generate the v0.9 form far more consistently. It also simplifies
polymorphism for JSON parsers in static languages.

### Data model updates

v0.8.1 adjacency-list array:

```json
"contents": [{ "key": "name", "valueString": "Alice" }]
```

v0.9 standard JSON at `path` with upsert semantics (omitted `value` removes
the key; arrays preserve length when an index is cleared):

```json
{ "updateDataModel": { "surfaceId": "s1", "path": "/user",
                       "value": { "name": "Alice" } } }
```

## Data binding & state

### Unified `path`

v0.8.1 used `dataBinding` inside `childrenProperty` templates and `path`
inside `BoundValue` — inconsistent. v0.9 uses `path` everywhere. Same word,
same meaning: JSON Pointer to data.

### Implicit typing

v0.8.1: `{ "text": { "literalString": "Hello" } }` or
`{ "text": { "path": "/msg" } }` — explicit wrapper required even for
literals.

v0.9: `{ "text": "Hello" }` and `{ "value": { "path": "/msg" } }` both
valid. `DynamicString`/`DynamicNumber`/`DynamicBoolean` in
`common_types.json` accept either a literal of the right primitive type or
a path/function call.

### String interpolation: `formatString`

v0.8.1 had no native interpolation — combining static text with bound
values required custom logic or pre-concatenation on the server.

v0.9 introduces `formatString`:

```json
{ "call": "formatString",
  "args": { "value": "Hello, ${/user/firstName}! It is ${formatDate(value: ${/now}, format: 'yyyy-MM-dd')}" } }
```

Important constraint: `${...}` interpolation works **only** inside
`formatString`, not in arbitrary string properties. This keeps the wire
format unambiguous.

### Explicit client → server data sync

v0.8.1 had no first-class way to send the data model back. v0.9
introduces the `sendDataModel: true` flag on `createSurface`; when set,
the client attaches the surface's full data model to every outbound
message's transport metadata.

## Component-specific changes

| Component | v0.8.1 | v0.9 |
| :--- | :--- | :--- |
| Button | `context: [{key, value}]`, `primary: true` | `context: { ... }`, `variant: "primary" \| "borderless"` |
| TextField | `textFieldType`, `validationRegexp`, prop `text` | `variant`, `checks: [...]`, prop `value` |
| MultipleChoice → ChoicePicker | `MultipleChoice`, `selections`, `maxAllowedSelections` | `ChoicePicker`, `value` (array), `variant: "multipleSelection" \| "mutuallyExclusive"` |
| Slider | `minValue`, `maxValue` | `min`, `max` |

## Error handling

v0.9 introduces the strict `VALIDATION_FAILED` format in `client_to_server.json`:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "surfaceId": "...",
    "path": "/components/0/text",
    "message": "Expected string, got number"
  }
}
```

This is the feedback half of the prompt-first loop — the LLM sees a
machine-readable description of what went wrong and can self-correct on the
next turn.

## Property-rename quick reference

| Component | Old name (v0.8.1) | New name (v0.9) |
| :--- | :--- | :--- |
| Row / Column | `distribution` | `justify` |
| Row / Column | `alignment` | `align` |
| Modal | `entryPointChild` | `trigger` |
| Modal | `contentChild` | `content` |
| Tabs | `tabItems` | `tabs` |
| TextField | `text` | `value` |
| many | `usageHint` | `variant` |
| client→server | `userAction` | `action` |
| common type | `childrenProperty` | `ChildList` |

## Migration checklist

1. **Update the extension URI** in Agent Cards from
   `.../a2a-extension/a2ui/v0.8` to `.../a2a-extension/a2ui/v0.9`.
2. **Update message names**: `surfaceUpdate` → `updateComponents`,
   `dataModelUpdate` → `updateDataModel`, `beginRendering` →
   `createSurface` (set `catalogId` explicitly; move `styles` → `theme`).
3. **Flatten components** — `{ "Text": { ... } }` → `{ "component": "Text", ... }`.
4. **Convert data model updates** to standard JSON objects at `path`.
5. **Convert bound values** — drop `{ "literalString": "x" }` for plain
   `"x"` where the field accepts `DynamicString`; keep `{ "path": "/foo" }`
   as is.
6. **Switch button context** from key-value array to a JSON object.
7. **Rename component properties** per the table above.
8. **Wrap A2A `DataPart.data` in a list** (it was a single object in v0.8).
9. **Implement the validation loop** — when validation fails, return the
   `VALIDATION_FAILED` error format and prompt the LLM to retry.

---

Source: `submodules/A2UI/specification/v0_9/docs/evolution_guide.md`.
