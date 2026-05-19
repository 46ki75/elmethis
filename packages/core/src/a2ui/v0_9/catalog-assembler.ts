/**
 * Catalog assembler — converts a set of A2UI `*Api` definitions (Zod
 * schemas + names) into a freestanding A2UI v0.9 catalog JSON Schema
 * document.
 *
 * The output mirrors the shape published by upstream A2UI (compare with
 * https://a2ui.org/specification/v0_9/basic_catalog.json):
 *
 *   - top-level `$schema`, `$id`, `catalogId`, `title`, `description`
 *   - `components`: each entry uses `allOf` of
 *       `#/$defs/ComponentCommon` + `#/$defs/CatalogComponentCommon` +
 *       an inline property block that includes a `component` const
 *       discriminator and a `required` list; the wrapper uses
 *       `unevaluatedProperties: false` (the only correct way to seal an
 *       allOf composition)
 *   - `$defs`: all referenced common types (DynamicString, ChildList,
 *     DataBinding, FunctionCall, …) inlined so the document has no
 *     external `$ref`s — agents and renderers can consume it directly
 *     without resolving `common_types.json`
 *
 * Component property schemas are derived from each `*Api.schema` via
 * `zod-to-json-schema`. We deliberately do **not** use that library's
 * `definitions` option: it expands union-shaped definitions into
 * sub-`$ref`s (e.g. `#/$defs/DynamicString/anyOf/0`) instead of a single
 * clean ref. We use a structural-fingerprint pass instead — convert each
 * common Zod schema once to its inlined JSON form, then walk every
 * component's output and replace any subtree whose fingerprint matches a
 * common type with `{ $ref: "#/$defs/<Name>" }`.
 *
 * `accessibility` and `weight` are stripped from each component's inline
 * property block because they are factored out into `ComponentCommon` /
 * `CatalogComponentCommon` respectively and arrive via the `allOf` refs.
 */
import { z, type ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  AccessibilityAttributesSchema,
  ChildListSchema,
  type ComponentApi,
  DataBindingSchema,
  DynamicBooleanSchema,
  DynamicNumberSchema,
  DynamicStringListSchema,
  DynamicStringSchema,
  DynamicValueSchema,
  FunctionCallSchema,
} from "@a2ui/web_core/v0_9";

export interface CatalogEnvelope {
  /** Stable URI identifying this catalog (both `$id` and `catalogId`). */
  id: string;
  title: string;
  description: string;
}

export interface AssembledCatalog {
  $schema: string;
  $id: string;
  catalogId: string;
  title: string;
  description: string;
  components: Record<string, unknown>;
  $defs: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Common types — hand-mirrored from upstream `common_types.json` so the
// freestanding catalog reads byte-identical to one assembled by the upstream
// Python tool. These are referenced by `$ref` from per-component schemas
// (e.g. `text: { "$ref": "#/$defs/DynamicString" }`).
// ---------------------------------------------------------------------------

const COMMON_DEFS: Record<string, unknown> = {
  ComponentId: {
    type: "string",
    description:
      "The unique identifier for a component, used for both definitions and references within the same surface.",
  },
  AccessibilityAttributes: {
    type: "object",
    description:
      "Attributes to enhance accessibility when using assistive technologies like screen readers.",
    properties: {
      label: {
        $ref: "#/$defs/DynamicString",
        description:
          "A short string, typically 1 to 3 words, used by assistive technologies to convey the purpose or intent of an element.",
      },
      description: {
        $ref: "#/$defs/DynamicString",
        description:
          "Additional information provided by assistive technologies about an element such as instructions, format requirements, or result of an action.",
      },
    },
  },
  ComponentCommon: {
    type: "object",
    properties: {
      id: { $ref: "#/$defs/ComponentId" },
      accessibility: { $ref: "#/$defs/AccessibilityAttributes" },
    },
    required: ["id"],
  },
  CatalogComponentCommon: {
    type: "object",
    properties: {
      weight: {
        type: "number",
        description:
          "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.",
      },
    },
  },
  ChildList: {
    oneOf: [
      {
        type: "array",
        items: { $ref: "#/$defs/ComponentId" },
        description: "A static list of child component IDs.",
      },
      {
        type: "object",
        description:
          "A template for generating a dynamic list of children from a data model list. The `componentId` is the component to use as a template.",
        properties: {
          componentId: { $ref: "#/$defs/ComponentId" },
          path: {
            type: "string",
            description:
              "The path to the list of component property objects in the data model.",
          },
        },
        required: ["componentId", "path"],
        additionalProperties: false,
      },
    ],
  },
  DataBinding: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "A JSON Pointer path to a value in the data model.",
      },
    },
    required: ["path"],
    additionalProperties: false,
  },
  FunctionCall: {
    type: "object",
    description: "A call to a catalog-defined function.",
    properties: {
      call: { type: "string", description: "The function name to invoke." },
      args: {
        type: "object",
        description: "Named arguments for the function call.",
        additionalProperties: true,
      },
      returnType: {
        type: "string",
        description:
          "The expected return type of the function call. Used to disambiguate overloads.",
      },
    },
    required: ["call"],
  },
  DynamicString: {
    description: "Represents a string",
    oneOf: [
      { type: "string" },
      { $ref: "#/$defs/DataBinding" },
      {
        allOf: [
          { $ref: "#/$defs/FunctionCall" },
          { properties: { returnType: { const: "string" } } },
        ],
      },
    ],
  },
  DynamicNumber: {
    description:
      "Represents a value that can be either a literal number, a path to a number in the data model, or a function call returning a number.",
    oneOf: [
      { type: "number" },
      { $ref: "#/$defs/DataBinding" },
      {
        allOf: [
          { $ref: "#/$defs/FunctionCall" },
          { properties: { returnType: { const: "number" } } },
        ],
      },
    ],
  },
  DynamicBoolean: {
    description:
      "A boolean value that can be a literal, a path, or a function call returning a boolean.",
    oneOf: [
      { type: "boolean" },
      { $ref: "#/$defs/DataBinding" },
      {
        allOf: [
          { $ref: "#/$defs/FunctionCall" },
          { properties: { returnType: { const: "boolean" } } },
        ],
      },
    ],
  },
  DynamicStringList: {
    description:
      "Represents a value that can be either a literal array of strings, a path to a string array in the data model, or a function call returning a string array.",
    oneOf: [
      { type: "array", items: { type: "string" } },
      { $ref: "#/$defs/DataBinding" },
      {
        allOf: [
          { $ref: "#/$defs/FunctionCall" },
          { properties: { returnType: { const: "array" } } },
        ],
      },
    ],
  },
  DynamicValue: {
    description:
      "A value that can be a literal, a path, or a function call returning any type.",
    oneOf: [
      { type: "string" },
      { type: "number" },
      { type: "boolean" },
      { type: "array" },
      { $ref: "#/$defs/DataBinding" },
      { $ref: "#/$defs/FunctionCall" },
    ],
  },
};

// Map of common Zod schemas → `$defs` names. Used to build structural
// fingerprints so that when these schemas appear inside a component, the
// inlined output can be collapsed into a `$ref` to the catalog-level `$def`.
const COMMON_BY_REF: ReadonlyArray<readonly [string, ZodTypeAny]> = [
  ["AccessibilityAttributes", AccessibilityAttributesSchema],
  ["ChildList", ChildListSchema],
  ["DataBinding", DataBindingSchema],
  ["DynamicBoolean", DynamicBooleanSchema],
  ["DynamicNumber", DynamicNumberSchema],
  ["DynamicString", DynamicStringSchema],
  ["DynamicStringList", DynamicStringListSchema],
  ["DynamicValue", DynamicValueSchema],
  ["FunctionCall", FunctionCallSchema],
];

// ---------------------------------------------------------------------------
// Structural fingerprinting — used to detect when a property's inlined
// schema is actually one of our common types so we can swap it for a `$ref`.
// ---------------------------------------------------------------------------

function stripDescriptions(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(stripDescriptions);
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      if (key === "description") continue;
      out[key] = stripDescriptions(obj[key]);
    }
    return out;
  }
  return node;
}

function fingerprint(node: unknown): string {
  return JSON.stringify(stripDescriptions(node));
}

function inlineZod(schema: ZodTypeAny): unknown {
  const raw = zodToJsonSchema(schema, {
    $refStrategy: "none",
    target: "jsonSchema7",
  }) as Record<string, unknown>;
  // Drop the top-level `$schema` field — it's only meaningful at the
  // document root, not at the definition level.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema: _drop, ...rest } = raw;
  return rest;
}

const FINGERPRINT_TO_REF = new Map<string, string>();
for (const [name, schema] of COMMON_BY_REF) {
  FINGERPRINT_TO_REF.set(fingerprint(inlineZod(schema)), name);
}

/**
 * Walks a JSON Schema subtree. Whenever it finds a node whose structural
 * fingerprint matches a registered common type, it replaces that node with
 * a `$ref` to the catalog-level `$def`, preserving any `description`
 * carried by the original node (allowed alongside `$ref` in JSON Schema
 * draft 2019-09+).
 */
function collapseCommonRefs(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(collapseCommonRefs);
  if (!node || typeof node !== "object") return node;

  const obj = node as Record<string, unknown>;
  const refName = FINGERPRINT_TO_REF.get(fingerprint(obj));
  if (refName !== undefined) {
    const description = obj.description;
    return description !== undefined
      ? { $ref: `#/$defs/${refName}`, description }
      : { $ref: `#/$defs/${refName}` };
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = collapseCommonRefs(v);
  return out;
}

// Keys factored out into `ComponentCommon` / `CatalogComponentCommon`. We
// strip them from each component's inline property block so they only appear
// in the document once — via the `allOf` refs at the wrapper level.
const FACTORED_OUT_KEYS = new Set(["accessibility", "weight"]);

interface RawComponentSchema {
  properties?: Record<string, unknown>;
  required?: readonly string[];
}

function buildComponentSchema(api: ComponentApi): Record<string, unknown> {
  // Wrapping with `z.object({ x: api.schema })` is a trick to keep
  // `zod-to-json-schema` from treating `api.schema` itself as the document
  // root — we only want to harvest its property block.
  const wrapped = z.object({ x: api.schema });
  const converted = zodToJsonSchema(wrapped, {
    $refStrategy: "none",
    target: "jsonSchema7",
  }) as { properties?: { x?: RawComponentSchema } };

  const inner = converted.properties?.x ?? {};
  const rawProperties = inner.properties ?? {};
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(rawProperties)) {
    if (FACTORED_OUT_KEYS.has(key)) continue;
    properties[key] = collapseCommonRefs(value);
  }
  for (const key of inner.required ?? []) {
    if (!FACTORED_OUT_KEYS.has(key)) required.push(key);
  }

  return {
    type: "object",
    allOf: [
      { $ref: "#/$defs/ComponentCommon" },
      { $ref: "#/$defs/CatalogComponentCommon" },
      {
        type: "object",
        properties: {
          component: { const: api.name },
          ...properties,
        },
        required: ["component", ...required],
      },
    ],
    unevaluatedProperties: false,
  };
}

/**
 * Assembles an A2UI v0.9 catalog from a list of `*Api` definitions.
 *
 * The result is a freestanding JSON Schema document — no external `$ref`s,
 * safe to serialize and serve at the URL identified by `envelope.id`. The
 * shape matches the upstream A2UI catalog convention exactly, so existing
 * agents and validators can consume it without special-casing.
 */
export function assembleCatalog(
  envelope: CatalogEnvelope,
  components: readonly ComponentApi[],
): AssembledCatalog {
  const componentsDef: Record<string, unknown> = {};
  for (const api of components) {
    componentsDef[api.name] = buildComponentSchema(api);
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: envelope.id,
    catalogId: envelope.id,
    title: envelope.title,
    description: envelope.description,
    components: componentsDef,
    $defs: { ...COMMON_DEFS },
  };
}
