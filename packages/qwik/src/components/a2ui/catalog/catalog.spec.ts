import { describe, expect, test } from "vitest";
import { z } from "zod";

import { CatalogRenderer, defineRenderer } from "./catalog";

const TextApi = {
  name: "Text",
  schema: z.object({ text: z.string() }),
} as const;

const ButtonApi = {
  name: "Button",
  schema: z.object({ label: z.string(), disabled: z.boolean().optional() }),
} as const;

describe("defineRenderer", () => {
  test("derives the entry name from the api", () => {
    const entry = defineRenderer(TextApi, () => null);
    expect(entry.name).toBe("Text");
  });

  test("preserves the render function", () => {
    const fn = () => null;
    const entry = defineRenderer(TextApi, fn);
    expect(entry.render).toBe(fn);
  });
});

describe("CatalogRenderer", () => {
  test("returns undefined for unknown types", () => {
    const catalog = new CatalogRenderer();
    expect(catalog.get("Nope")).toBeUndefined();
  });

  test("get returns the registered render function", () => {
    const fn = () => null;
    const catalog = new CatalogRenderer([defineRenderer(TextApi, fn)]);
    expect(catalog.get("Text")).toBe(fn);
  });

  test("names enumerates registered entries", () => {
    const catalog = new CatalogRenderer([
      defineRenderer(TextApi, () => null),
      defineRenderer(ButtonApi, () => null),
    ]);
    expect(catalog.names().sort()).toEqual(["Button", "Text"]);
  });

  test("extend layers new entries on top without mutating the base", () => {
    const baseText = () => null;
    const base = new CatalogRenderer([defineRenderer(TextApi, baseText)]);
    const extended = base.extend(defineRenderer(ButtonApi, () => null));

    expect(base.names()).toEqual(["Text"]);
    expect(extended.names().sort()).toEqual(["Button", "Text"]);
    expect(extended.get("Text")).toBe(baseText);
  });

  test("extend overrides entries with the same name", () => {
    const original = () => null;
    const replacement = () => null;
    const base = new CatalogRenderer([defineRenderer(TextApi, original)]);
    const extended = base.extend(defineRenderer(TextApi, replacement));

    expect(base.get("Text")).toBe(original);
    expect(extended.get("Text")).toBe(replacement);
  });

  test("extend accepts other CatalogRenderer instances", () => {
    const a = new CatalogRenderer([defineRenderer(TextApi, () => null)]);
    const b = new CatalogRenderer([defineRenderer(ButtonApi, () => null)]);
    const merged = a.extend(b);
    expect(merged.names().sort()).toEqual(["Button", "Text"]);
  });

  test("last extend argument wins for duplicate names", () => {
    const first = () => null;
    const second = () => null;
    const merged = new CatalogRenderer().extend(
      defineRenderer(TextApi, first),
      defineRenderer(TextApi, second),
    );
    expect(merged.get("Text")).toBe(second);
  });
});
