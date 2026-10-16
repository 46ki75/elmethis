/**
 * Method A — runtime catalog constant.
 *
 * Exposes the Notion block catalog as a freestanding A2UI v0.9 JSON Schema
 * document. Assembly is deferred until `components` or `$defs` is accessed,
 * so consumers importing only metadata do not run schema generation.
 * Consumers that need the schema at runtime (e.g. for an LLM system prompt
 * or inbound message validation) can serialize this object normally.
 *
 * Consumers that want the document as a hostable artifact use Method B:
 * `dist/a2ui/v0_9/notion_block_catalog.json` is emitted at build time from this
 * same constant and is served at the URL identified by
 * `NOTION_BLOCK_CATALOG_ID`.
 */
import { assembleCatalog, type AssembledCatalog } from "./catalog-assembler";
import {
  AudioApi,
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
  HtmlApi,
  IconApi,
  KatexApi,
  LinkTextApi,
  ListApi,
  ListItemApi,
  MermaidApi,
  NotionCalloutApi,
  ParagraphApi,
  RichTextApi,
  RowApi,
  TableApi,
  TableCellApi,
  TableRowApi,
  ToggleApi,
  UnsupportedApi,
  VideoApi,
} from "./notion-block-catalog";

/**
 * Stable URI identifying the Notion block catalog. Lives under the
 * `elmethis` GitHub Pages site so the JSON Schema is fetchable by
 * third-party agents and validators that look up `catalogId`.
 */
export const NOTION_BLOCK_CATALOG_ID =
  "https://46ki75.github.io/elmethis/a2ui/v0_9/notion_block_catalog.json";

const NOTION_BLOCK_CATALOG_COMPONENTS = [
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
  NotionCalloutApi,
  DividerApi,
  ToggleApi,
  BookmarkApi,
  FileApi,
  AudioApi,
  VideoApi,
  BlockImageApi,
  HtmlApi,
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

const envelope = {
  id: NOTION_BLOCK_CATALOG_ID,
  title: "Elmethis Notion Block Catalog",
  description:
    "Notion block-level A2UI components used by the @elmethis renderers (typography, media, code, math, table, tabs). Extends — does not replace — the A2UI Basic Catalog.",
};

let assembledCatalog: AssembledCatalog | undefined;

function getCatalog(): AssembledCatalog {
  return (assembledCatalog ??= assembleCatalog(
    envelope,
    NOTION_BLOCK_CATALOG_COMPONENTS,
  ));
}

// Enumerable accessors preserve JSON serialization and share one assembled
// result. Setters retain the existing writable AssembledCatalog interface.
export const notionBlockCatalogJson: AssembledCatalog = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: envelope.id,
  catalogId: envelope.id,
  title: envelope.title,
  description: envelope.description,
  get components() {
    return getCatalog().components;
  },
  set components(value) {
    getCatalog().components = value;
  },
  get $defs() {
    return getCatalog().$defs;
  },
  set $defs(value) {
    getCatalog().$defs = value;
  },
};
