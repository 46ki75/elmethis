import { expect, test, vi } from "vitest";

import type { AssembledCatalog } from "./catalog-assembler";
import {
  NOTION_BLOCK_CATALOG_ID,
  notionBlockCatalogJson,
} from "./notion-block-catalog-json";

const { assembleCatalog } = vi.hoisted(() => ({
  assembleCatalog: vi.fn(),
}));

vi.mock("./catalog-assembler", () => ({ assembleCatalog }));

const callsOnImport = assembleCatalog.mock.calls.length;

test("defers catalog assembly until schema access and caches the result", () => {
  expect(callsOnImport).toBe(0);
  expect(assembleCatalog).not.toHaveBeenCalled();
  expect(notionBlockCatalogJson.catalogId).toBe(NOTION_BLOCK_CATALOG_ID);
  expect(notionBlockCatalogJson.$id).toBe(NOTION_BLOCK_CATALOG_ID);
  expect(Object.keys(notionBlockCatalogJson)).toEqual([
    "$schema",
    "$id",
    "catalogId",
    "title",
    "description",
    "components",
    "$defs",
  ]);
  expect(assembleCatalog).not.toHaveBeenCalled();

  const assembled: AssembledCatalog = {
    $schema: notionBlockCatalogJson.$schema,
    $id: NOTION_BLOCK_CATALOG_ID,
    catalogId: NOTION_BLOCK_CATALOG_ID,
    title: notionBlockCatalogJson.title,
    description: notionBlockCatalogJson.description,
    components: { Example: { type: "object" } },
    $defs: { ComponentId: { type: "string" } },
  };
  assembleCatalog.mockReturnValue(assembled);

  expect(notionBlockCatalogJson.components).toBe(assembled.components);
  expect(notionBlockCatalogJson.$defs).toBe(assembled.$defs);
  expect(notionBlockCatalogJson.components).toBe(assembled.components);
  expect(JSON.parse(JSON.stringify(notionBlockCatalogJson))).toEqual(assembled);
  expect(assembleCatalog).toHaveBeenCalledExactlyOnceWith(
    {
      id: NOTION_BLOCK_CATALOG_ID,
      title: assembled.title,
      description: assembled.description,
    },
    expect.any(Array),
  );

  // AssembledCatalog is writable; deferral must not turn its schema fields
  // into read-only properties for existing consumers.
  const components = { Replacement: { type: "string" } };
  const definitions = { Replacement: { type: "number" } };
  notionBlockCatalogJson.components = components;
  notionBlockCatalogJson.$defs = definitions;
  expect(notionBlockCatalogJson.components).toBe(components);
  expect(notionBlockCatalogJson.$defs).toBe(definitions);
  expect(assembleCatalog).toHaveBeenCalledTimes(1);
});
