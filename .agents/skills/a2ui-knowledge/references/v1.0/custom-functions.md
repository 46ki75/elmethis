# A2UI v1.0 — Custom Functions

A2UI functions are first-class members of a Catalog alongside components. When
you define a custom catalog you can add functions for your application — e.g.
a string `trim` or a hardware-query helper like `getScreenResolution`.

This reference covers the v1.0 specifics. Two things changed from v0.9:

1. The catalog `functions` field is a **map** keyed by function name (it was a
   list-style `oneOf` in v0.9).
2. Functions carry **`callableFrom`** (execution boundary) and **`returnType`**
   as catalog metadata. These are removed from the wire `FunctionCall` — they
   are verified at runtime against the catalog, not on the wire.

## 1. Add functions to the catalog (a map)

Use a `functions` object keyed by function name. Each entry is a
`FunctionDefinition`: the `FunctionCall` validation shape (`call` + `args`)
plus the metadata fields `returnType` (required) and optional `callableFrom`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/custom_catalog.json",
  "title": "Custom Function Catalog",
  "description": "Adds string trimming and screen-resolution functions.",
  "functions": {
    "trim": {
      "type": "object",
      "description": "Removes whitespace from the beginning and end of a string.",
      "returnType": "string",
      "callableFrom": "clientOrRemote",
      "properties": {
        "call": { "const": "trim" },
        "args": {
          "type": "object",
          "properties": {
            "value": {
              "$ref": "common_types.json#/$defs/DynamicString",
              "description": "The string to trim."
            },
            "chars": {
              "$ref": "common_types.json#/$defs/DynamicString",
              "description": "Optional. Characters to remove. Defaults to whitespace."
            }
          },
          "required": ["value"],
          "unevaluatedProperties": false
        }
      },
      "required": ["call", "args"],
      "unevaluatedProperties": false
    },
    "getScreenResolution": {
      "type": "object",
      "description": "Queries hardware for screen resolution.",
      "returnType": "array",
      "callableFrom": "remoteOnly",
      "properties": {
        "call": { "const": "getScreenResolution" },
        "args": {
          "type": "object",
          "properties": {
            "screenIndex": {
              "$ref": "common_types.json#/$defs/DynamicNumber",
              "description": "Optional. Defaults to 0 (primary screen)."
            }
          },
          "unevaluatedProperties": false
        }
      },
      "required": ["call", "args"],
      "unevaluatedProperties": false
    }
  }
}
```

Conventions:

- `call` is a constant matching the map key — the validator's discriminator.
- `args` reuses `common_types.json` types (`DynamicString`, `DynamicNumber`, …)
  so the same binding semantics apply.
- `returnType` is one of `string`, `number`, `boolean`, `array`, `object`,
  `any`, `void`.
- `callableFrom` is `clientOnly` (default), `remoteOnly`, or `clientOrRemote`.
- Function names must conform to **UAX #31** and MUST NOT start with `@`
  (reserved for system functions like `@index`).

## 2. Expose them via `anyFunction`

The wire `FunctionCall` refers to a catalog-agnostic `anyFunction`. Your
catalog defines that reference to enumerate which functions exist:

```json
{
  "$defs": {
    "anyFunction": {
      "oneOf": [
        { "$ref": "#/functions/trim" },
        { "$ref": "#/functions/getScreenResolution" }
      ]
    }
  }
}
```

To extend rather than replace the built-ins, `oneOf`-in the Basic Catalog's
`anyFunction`:

```json
{
  "$defs": {
    "anyFunction": {
      "oneOf": [
        { "$ref": "#/functions/trim" },
        { "$ref": "#/functions/getScreenResolution" },
        { "$ref": "catalogs/basic/catalog.json#/$defs/anyFunction" }
      ]
    }
  }
}
```

For production, ship a freestanding catalog (no external `$ref`s) by inlining
dependencies.

## 3. Execution boundaries (`callableFrom`)

`callableFrom` governs where a function may run. The boundary is **enforced at
runtime by the client**, not on the wire:

- When a server sends a `callFunction`, the client looks up the function in its
  active catalog and reads `callableFrom`. If omitted, the boundary defaults to
  `clientOnly`.
- A remote `callFunction` targeting a `clientOnly` function — or a function not
  registered at all — MUST be rejected with a client-to-server `error` whose
  `code` is `INVALID_FUNCTION_CALL` (carrying the `functionCallId`).

```json
{
  "version": "v1.0",
  "error": {
    "code": "INVALID_FUNCTION_CALL",
    "message": "Function 'validateLocalInput' is clientOnly and cannot be invoked remotely.",
    "functionCallId": "call_123"
  }
}
```

## 4. Server-initiated calls (`callFunction` / `functionResponse`)

A `remoteOnly` or `clientOrRemote` function can be invoked by the server:

```json
{
  "version": "v1.0",
  "functionCallId": "res_1",
  "wantResponse": true,
  "callFunction": { "call": "getScreenResolution", "args": { "screenIndex": 0 } }
}
```

If `wantResponse` is `true`, the client replies with a `functionResponse`
(copying `functionCallId` and `call` verbatim) or an `error`:

```json
{
  "version": "v1.0",
  "functionResponse": { "functionCallId": "res_1", "call": "getScreenResolution", "value": [1920, 1080] }
}
```

## 5. How validation works

When a `FunctionCall` is validated:

1. **Discriminator lookup** — the validator reads `call`.
2. **Schema matching** — `call: "length"` matches the built-in `length`;
   `call: "trim"` matches your custom `trim`; `call: "unknownFunc"` fails
   immediately (strict mode).
3. **Args validation** — the matched schema's `args` enforce argument types.

Note the wire `FunctionCall` carries only `call` and `args`; `callableFrom` and
`returnType` are not on the wire and are checked at runtime.

## 6. Implementing the function (renderer side)

The schema describes the contract; the renderer registers a runtime
implementation (see `renderer-guide.md`). Pure-logic functions (e.g. `trim`)
return a static value; external-state functions (e.g. `getScreenResolution`)
return a reactive stream; effect functions (e.g. `openUrl`) return `void`.

---

Source: `specification/v1_0/docs/a2ui_custom_functions.md` and
`specification/v1_0/json/client_capabilities.json` in `a2ui-project/a2ui`.
