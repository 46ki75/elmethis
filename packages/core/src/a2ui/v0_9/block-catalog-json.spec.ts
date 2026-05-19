/**
 * Regression-pins for the assembled block catalog. The catalog is the
 * artifact that gets shipped to GitHub Pages and consumed by LLM agents,
 * so any structural drift away from the A2UI v0.9 standard breaks
 * downstream consumers silently.
 *
 * What we pin here:
 *   - The whole document validates as JSON Schema draft 2020-12.
 *   - Every component declared in `block-catalog.ts` is registered in the
 *     catalog (no silent omissions when adding new components).
 *   - Each component carries a `component` const discriminator inside its
 *     allOf, and lists it as required (this is what lets an LLM pick the
 *     right schema and what lets validators reject malformed payloads).
 *   - The document is **freestanding** — no external `$ref`s. All refs
 *     must point inside `#/`. (External refs would force consumers to
 *     resolve `common_types.json` themselves.)
 *   - Sample payload round-trip: a syntactically valid `Heading` payload
 *     validates; a payload missing the required `level` fails.
 */
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, test } from "vitest";

import { blockCatalogJson, BLOCK_CATALOG_ID } from "./block-catalog-json";
import * as schemas from "./block-catalog";

function newAjv() {
  return new Ajv2020({ strict: false, allErrors: true });
}

describe("blockCatalogJson", () => {
  test("declares the GitHub Pages catalogId", () => {
    expect(blockCatalogJson.catalogId).toBe(BLOCK_CATALOG_ID);
    expect(blockCatalogJson.$id).toBe(BLOCK_CATALOG_ID);
  });

  test("declares draft 2020-12", () => {
    expect(blockCatalogJson.$schema).toBe(
      "https://json-schema.org/draft/2020-12/schema",
    );
  });

  test("registers every *Api exported from block-catalog.ts", () => {
    const hasNameField = (
      v: unknown,
    ): v is Record<string, unknown> & { name: string } =>
      typeof v === "object" &&
      v !== null &&
      "name" in v &&
      typeof (v as { name: unknown }).name === "string";

    const apiNames = Object.values(schemas)
      .filter(hasNameField)
      .map((v) => v.name)
      .sort();

    // De-dupe in case re-exports overlap.
    const uniqueApiNames = Array.from(new Set(apiNames));
    const componentNames = Object.keys(blockCatalogJson.components).sort();

    expect(componentNames).toEqual(uniqueApiNames);
  });

  test("every component has a `component` const discriminator and lists it as required", () => {
    for (const [name, schema] of Object.entries(blockCatalogJson.components)) {
      const s = schema as {
        allOf?: ReadonlyArray<{
          properties?: { component?: { const?: string } };
          required?: readonly string[];
        }>;
      };
      const inline = s.allOf?.[2];
      expect(
        inline?.properties?.component?.const,
        `${name} discriminator`,
      ).toBe(name);
      expect(inline?.required, `${name} required`).toContain("component");
    }
  });

  test("every component uses unevaluatedProperties: false (sealed allOf)", () => {
    for (const [name, schema] of Object.entries(blockCatalogJson.components)) {
      const s = schema as { unevaluatedProperties?: boolean };
      expect(s.unevaluatedProperties, `${name} sealed`).toBe(false);
    }
  });

  test("document is freestanding — every $ref stays inside the document", () => {
    const externalRefs: string[] = [];
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(
          node as Record<string, unknown>,
        )) {
          if (k === "$ref" && typeof v === "string" && !v.startsWith("#/")) {
            externalRefs.push(v);
          }
          walk(v);
        }
      }
    };
    walk(blockCatalogJson);
    expect(externalRefs).toEqual([]);
  });

  test("compiles cleanly with ajv (draft 2020-12)", () => {
    const ajv = newAjv();
    // Compile the catalog as a meta-schema-aware document. Add it once with
    // its $id and then compile a reference into one of its component slots.
    ajv.addSchema(blockCatalogJson as object);
    const validate = ajv.compile({
      $ref: `${BLOCK_CATALOG_ID}#/components/Heading`,
    });
    expect(validate).toBeTypeOf("function");
  });

  test("a valid Heading payload validates; an invalid one fails", () => {
    const ajv = newAjv();
    ajv.addSchema(blockCatalogJson as object);
    const validate = ajv.compile({
      $ref: `${BLOCK_CATALOG_ID}#/components/Heading`,
    });

    const ok = {
      id: "heading-1",
      component: "Heading",
      level: 2,
      children: ["text-1", "text-2"],
    };
    expect(validate(ok), JSON.stringify(validate.errors)).toBe(true);

    // Missing required `level` → must fail.
    const missingLevel = {
      id: "heading-1",
      component: "Heading",
      children: ["text-1"],
    };
    expect(validate(missingLevel)).toBe(false);

    // Wrong discriminator → must fail.
    const wrongDiscriminator = {
      id: "heading-1",
      component: "NotHeading",
      level: 2,
      children: ["text-1"],
    };
    expect(validate(wrongDiscriminator)).toBe(false);
  });

  test("a RichText payload validates with a path-bound text (DynamicString)", () => {
    const ajv = newAjv();
    ajv.addSchema(blockCatalogJson as object);
    const validate = ajv.compile({
      $ref: `${BLOCK_CATALOG_ID}#/components/RichText`,
    });

    // Path binding form of DynamicString.
    const bound = {
      id: "rt-1",
      component: "RichText",
      text: { path: "/user/name" },
    };
    expect(validate(bound), JSON.stringify(validate.errors)).toBe(true);

    // Literal form.
    const literal = {
      id: "rt-2",
      component: "RichText",
      text: "Hello, world",
    };
    expect(validate(literal), JSON.stringify(validate.errors)).toBe(true);
  });

  test("ChildList template form validates as `children` (Heading)", () => {
    const ajv = newAjv();
    ajv.addSchema(blockCatalogJson as object);
    const validate = ajv.compile({
      $ref: `${BLOCK_CATALOG_ID}#/components/Heading`,
    });

    const templated = {
      id: "h-1",
      component: "Heading",
      level: 1,
      children: { componentId: "tpl-row", path: "/items" },
    };
    expect(validate(templated), JSON.stringify(validate.errors)).toBe(true);
  });
});
