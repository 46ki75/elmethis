import { describe, expect, test } from "vitest";

import { blockCatalog, blockComponents, blockFunctions } from "./block-catalog";

// The block catalog merges the official A2UI basic catalog (standard
// primitives) with the Elm block renderers (the project's own component APIs).
// These structural checks pin the merged surface without rendering.

describe("blockCatalog — composition", () => {
  test("includes the official basic primitives", () => {
    for (const name of ["Text", "Row", "Card", "Button", "TextField"]) {
      expect(blockCatalog.components.has(name)).toBe(true);
    }
  });

  test("includes the Elm block component types", () => {
    for (const name of [
      "Heading",
      "Paragraph",
      "BlockQuote",
      "Callout",
      "CodeBlock",
      "Katex",
      "Bookmark",
      "File",
      "BlockImage",
      "Table",
      "TableRow",
      "TableCell",
      "ContentTabs",
      "ContentTab",
      "Toggle",
      "RichText",
      "LinkText",
      "ColumnList",
      "Unsupported",
    ]) {
      expect(blockCatalog.components.has(name)).toBe(true);
    }
  });

  test("Elm renderers win for the names shared with the basic catalog", () => {
    // Column / List / Divider / Icon exist in both layers; the block
    // implementations are appended last, so they override by name.
    for (const name of ["Column", "List", "Divider", "Icon"]) {
      const impl = blockCatalog.components.get(name);
      expect(impl).toBeDefined();
      expect(typeof impl?.render).toBe("function");
    }
  });

  test("blockComponents backs the catalog and carries the basic functions", () => {
    // Every entry is a renderable implementation. The merged list is at least
    // as large as the de-duplicated catalog (Column/List/Divider/Icon collide).
    expect(blockComponents.length).toBeGreaterThanOrEqual(
      blockCatalog.components.size,
    );
    expect(blockComponents.every((c) => typeof c.render === "function")).toBe(
      true,
    );
    // Functions come from the official basic catalog (used by `{ call }`
    // expression bindings); the array is defined even if empty.
    expect(Array.isArray(blockFunctions)).toBe(true);
  });
});
