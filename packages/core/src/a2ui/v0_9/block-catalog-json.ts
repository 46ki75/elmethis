/**
 * Method A — runtime catalog constant.
 *
 * Assembles the block catalog from the `*Api` Zod definitions into a
 * freestanding A2UI v0.9 catalog JSON Schema document. Consumers that want
 * the catalog at runtime (e.g. to feed into an LLM system prompt or to
 * validate an inbound A2UI message) import `blockCatalogJson` directly.
 *
 * Consumers that want the document as a hostable artifact use Method B:
 * `dist/a2ui/block_catalog.json` is emitted at build time from this same
 * constant and is served at the URL identified by `BLOCK_CATALOG_ID`.
 */
import { assembleCatalog, type AssembledCatalog } from "./catalog-assembler";
import {
  BlockImageApi,
  BlockQuoteApi,
  BookmarkApi,
  CalloutApi,
  CodeBlockApi,
  ColumnApi,
  ColumnListApi,
  ContentTabApi,
  ContentTabsApi,
  DividerApi,
  FileApi,
  HeadingApi,
  IconApi,
  KatexApi,
  LinkTextApi,
  ListApi,
  ListItemApi,
  MermaidApi,
  ParagraphApi,
  RichTextApi,
  RowApi,
  TableApi,
  TableCellApi,
  TableRowApi,
  ToggleApi,
  UnsupportedApi,
} from "./block-catalog";

/**
 * Stable URI identifying the block catalog. Lives under the `elmethis`
 * GitHub Pages site so the JSON Schema is fetchable by third-party agents
 * and validators that look up `catalogId`.
 */
export const BLOCK_CATALOG_ID =
  "https://46ki75.github.io/elmethis/a2ui/v0_9/block_catalog.json";

const BLOCK_CATALOG_COMPONENTS = [
  RichTextApi,
  LinkTextApi,
  IconApi,
  RowApi,
  ColumnApi,
  ColumnListApi,
  HeadingApi,
  ParagraphApi,
  ListApi,
  ListItemApi,
  BlockQuoteApi,
  CalloutApi,
  DividerApi,
  ToggleApi,
  BookmarkApi,
  FileApi,
  BlockImageApi,
  CodeBlockApi,
  KatexApi,
  MermaidApi,
  ContentTabApi,
  ContentTabsApi,
  TableApi,
  TableRowApi,
  TableCellApi,
  UnsupportedApi,
];

export const blockCatalogJson: AssembledCatalog = assembleCatalog(
  {
    id: BLOCK_CATALOG_ID,
    title: "Elmethis Block Catalog",
    description:
      "Block-level A2UI components used by the @elmethis renderers (typography, media, code, math, table, tabs). Extends — does not replace — the A2UI Basic Catalog.",
  },
  BLOCK_CATALOG_COMPONENTS,
);
