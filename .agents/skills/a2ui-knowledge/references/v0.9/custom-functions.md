# A2UI v0.9 — Custom Functions

A2UI functions are first-class members of a Catalog alongside components. When
you define a custom catalog, you can add functions that suit your application
or design system — e.g. a string `trim` or a hardware-query helper like
`getScreenResolution`.

This reference walks through defining custom functions and wiring them in
so validators recognize them.

## 1. Add functions to the catalog JSON Schema

Use a `functions` map keyed by function name. Each entry is a schema for the
`FunctionCall` shape — `call`, `args`, and `returnType`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/custom_catalog.json",
  "title": "Custom Function Catalog",
  "functions": {
    "trim": {
      "type": "object",
      "description": "Removes whitespace (or other characters) from the beginning and end of a string.",
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
              "description": "Optional. A set of characters to remove. Defaults to whitespace."
            }
          },
          "required": ["value"],
          "unevaluatedProperties": false
        },
        "returnType": { "const": "string" }
      },
      "required": ["call", "args"],
      "unevaluatedProperties": false
    },

    "getScreenResolution": {
      "type": "object",
      "description": "Queries hardware for screen resolution.",
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
        },
        "returnType": { "const": "array" }
      },
      "required": ["call", "args"],
      "unevaluatedProperties": false
    }
  }
}
```

Key conventions:

- `call` is a constant matching the function name — that's what the validator
  uses as a discriminator.
- `args` is an object with named properties; reuse `common_types.json` types
  (`DynamicString`, `DynamicNumber`, …) so the same binding semantics work.
- `returnType` is one of `string`, `number`, `boolean`, `array`, `object`,
  `any`, `void`.
- `unevaluatedProperties: false` everywhere keeps the LLM honest about not
  emitting extra fields.

## 2. Expose them via `anyFunction`

The `FunctionCall` definition in the envelope refers to a catalog-agnostic
`anyFunction`. Your catalog must define that reference to enumerate which
functions actually exist:

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

### Including the Basic Catalog's functions

To extend rather than replace the built-ins (`required`, `regex`, `email`,
`formatString`, …), `oneOf`-in the Basic Catalog's `anyFunction`:

```json
{
  "$defs": {
    "anyFunction": {
      "oneOf": [
        { "$ref": "#/functions/trim" },
        { "$ref": "#/functions/getScreenResolution" },
        { "$ref": "basic_catalog.json#/$defs/anyFunction" }
      ]
    }
  }
}
```

If you're producing a freestanding (no external `$ref`) catalog for production
use, run `tools/build_catalog/assemble_catalog.py` to inline the dependencies.

## 3. How validation works

When a `FunctionCall` is validated:

1. **Discriminator lookup** — the validator reads `call`.
2. **Schema matching** —
   - `call: "length"` → matches the built-in `length` schema, validates `args`.
   - `call: "trim"` → matches your custom `trim` schema.
   - `call: "unknownFunc"` → fails immediately (strict mode).
3. **Args validation** — the matched schema's `args` properties enforce types
   on each named argument.

This strict-by-default approach catches typos early and lets you add
capabilities with full type safety.

## 4. Implementing the function (renderer side)

The schema only describes the contract. The renderer must also provide a
**runtime implementation** registered in its catalog (`FunctionImplementation`
in the renderer architecture — see `renderer-guide.md`). The implementation
receives statically resolved `args` and returns either a value or a reactive
stream:

- **Pure-logic functions** (e.g. `trim`) — synchronous, return a static value.
- **External-state functions** (e.g. `getScreenResolution` that watches the
  display) — return a reactive stream so changes propagate to the UI.
- **Effect functions** (e.g. `openUrl`) — return `void`; triggered by user
  actions, not interpolation.

If the function returns a reactive stream, use an idiomatic listening mechanism
that supports unsubscription — the binder layer disposes subscriptions on
component unmount.

---

Source: `submodules/A2UI/specification/v0_9/docs/a2ui_custom_functions.md`.
