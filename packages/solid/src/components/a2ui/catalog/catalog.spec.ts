import { describe, expect, it } from "vitest";
import { BASIC_FUNCTIONS, TextApi } from "@a2ui/web_core/v0_9/basic_catalog";

import { CatalogRenderer, defineRenderer } from "./catalog";

describe("CatalogRenderer", () => {
  it("pairs renderers with their schemas and extends immutably", () => {
    const original = defineRenderer(TextApi, ({ props }) => props.text);
    const replacement = defineRenderer(
      TextApi,
      ({ props }) => `new:${props.text}`,
    );
    const base = new CatalogRenderer([original]);
    const extended = base.extend(replacement);

    expect(base.get("Text")).toBe(original);
    expect(extended.get("Text")).toBe(replacement);
    expect(extended.toCatalog("test").components.get("Text")).toBe(replacement);
  });

  it("merges inherited functions by name with later catalogs winning", () => {
    const replaced = BASIC_FUNCTIONS[0]!;
    const retained = BASIC_FUNCTIONS[1]!;
    const added = BASIC_FUNCTIONS[2]!;
    const replacement = { ...replaced, execute: () => "replacement" };
    const base = new CatalogRenderer([], [replaced, retained]);
    const override = new CatalogRenderer([], [replacement, added]);

    const extended = base.extend(override);

    expect(base.functions).toEqual([replaced, retained]);
    expect(extended.functions).toEqual([replacement, retained, added]);
    expect([...extended.toCatalog("test").functions.values()]).toEqual([
      replacement,
      retained,
      added,
    ]);
  });
});
