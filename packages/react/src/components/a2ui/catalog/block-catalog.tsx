/**
 * Elmethis "block" catalog — typography, media, code, math, table, tabs, and a
 * fallback. Built on the **official** `@a2ui/react` generic binder: each entry
 * is a `createComponentImplementation(api, ReactFC)` mapping an `@elmethis/core`
 * component API onto the project's `Elm*` components. The official `basicCatalog`
 * (A2UI v0.9 Basic Catalog) is merged underneath so a single catalog serves
 * both the standard primitives and the richer block elements.
 *
 * Differences from the qwik reference (`defineRenderer`):
 *   - The binder pre-resolves bindings, so `props.text` is already a value —
 *     there is no per-renderer `resolve()`.
 *   - Children render through the host's `buildChild(id, basePath)`; the
 *     `renderChildList` / `childEntries` helpers mirror the package's internal
 *     `ChildList`.
 *   - The binder's render signature is `{ props, buildChild, context }` with no
 *     sibling `index`, so the qwik first-child-margin override and the
 *     `TableCell` `columnIndex` row-header promotion are not wired here.
 */
import { Fragment, type CSSProperties } from "react";
import {
  basicCatalog,
  createComponentImplementation,
  type ReactComponentImplementation,
} from "@a2ui/react/v0_9";
import { Catalog } from "@a2ui/web_core/v0_9";
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
  TableApi,
  TableCellApi,
  TableRowApi,
  ToggleApi,
  UnsupportedApi,
} from "@elmethis/core";

import { ElmKatex } from "../../code/elm-katex";
import { ElmCodeBlock } from "../../code/elm-code-block";
import { ElmInlineIcon } from "../../icon/elm-inline-icon";
import { ElmBlockImage } from "../../media/elm-block-image";
import { ElmFile } from "../../media/elm-file";
import { ElmBookmark } from "../../navigation/elm-bookmark";
import {
  ElmTab,
  ElmTabList,
  ElmTabPanel,
  ElmTabs,
} from "../../containments/elm-tabs";
import { ElmToggle } from "../../containments/elm-toggle";
import { ElmBlockQuote } from "../../typography/elm-block-quote";
import { ElmCallout } from "../../typography/elm-callout";
import { ElmDivider } from "../../typography/elm-divider";
import { ElmHeading } from "../../typography/elm-heading";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { ElmList } from "../../typography/elm-list";
import { ElmParagraph } from "../../typography/elm-paragraph";
import {
  ElmTable,
  ElmTableBody,
  ElmTableCell,
  ElmTableHeader,
  ElmTableRow,
} from "../../table";
import { ElmUnsupportedBlock } from "../../fallback/elm-unsupported-block";

import {
  alignItemsMap,
  childEntries,
  childListIds,
  justifyContentMap,
  renderChildList,
} from "./catalog-utils";

const BLOCK_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/basic_catalog.json";

// Mirrors the multi-column layout in elm-jarkup.module.css.
const columnListStyle: CSSProperties = {
  boxSizing: "content-box",
  paddingBlock: "0.25rem",
  width: "100%",
  display: "flex",
  flexDirection: "row",
  gap: "0.25rem",
  justifyContent: "space-around",
  overflowX: "auto",
};

/**
 * The Elm block component implementations. Each is typed by its
 * `@elmethis/core` API schema; the binder injects resolved `props`.
 */
// The binder's resolved prop types vary per schema and don't all expose the
// exact fields these renderers read; cast access where the inferred type is
// too narrow. Behavior is validated by the component specs.
/* eslint-disable @typescript-eslint/no-explicit-any */
const blockImplementations: ReactComponentImplementation[] = [
  // ----- Inline -----
  createComponentImplementation(RichTextApi, ({ props }: any) => {
    const decoration: string[] = props.decoration ?? [];
    if (decoration.includes("katex"))
      return <ElmKatex expression={props.text} block={false} />;
    return (
      <ElmInlineText
        bold={decoration.includes("bold")}
        italic={decoration.includes("italic")}
        underline={decoration.includes("underline")}
        strikethrough={decoration.includes("strikethrough")}
        code={decoration.includes("code")}
        color={props.color}
        ruby={props.ruby}
      >
        {props.text}
      </ElmInlineText>
    );
  }),

  createComponentImplementation(LinkTextApi, ({ props }: any) => (
    <ElmInlineText href={props.href} favicon={props.favicon}>
      {props.text}
    </ElmInlineText>
  )),

  createComponentImplementation(IconApi, ({ props }: any) => (
    <ElmInlineIcon src={props.src} alt={props.alt} />
  )),

  // ----- Layout (overrides basic Column with widthRatio support) -----
  createComponentImplementation(ColumnApi, ({ props, buildChild }: any) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: justifyContentMap[props.justify ?? "start"],
        alignItems: alignItemsMap[props.align ?? "stretch"],
        flex: props.widthRatio != null ? String(props.widthRatio) : undefined,
        boxSizing: "border-box",
        padding: "0.125rem",
      }}
    >
      {renderChildList(props.children, buildChild)}
    </div>
  )),

  createComponentImplementation(ColumnListApi, ({ props, buildChild }: any) => (
    <div style={columnListStyle}>
      {renderChildList(props.children, buildChild)}
    </div>
  )),

  // ----- Block typography -----
  createComponentImplementation(HeadingApi, ({ props, buildChild }: any) => (
    <ElmHeading level={props.level}>
      {renderChildList(props.children, buildChild)}
    </ElmHeading>
  )),

  createComponentImplementation(ParagraphApi, ({ props, buildChild }: any) => (
    <ElmParagraph color={props.color} backgroundColor={props.backgroundColor}>
      {renderChildList(props.children, buildChild)}
    </ElmParagraph>
  )),

  createComponentImplementation(ListApi, ({ props, buildChild }: any) => (
    <ElmList listStyle={props.style ?? "unordered"}>
      {childEntries(props.children).map(({ id, basePath }, i) => (
        <li key={`${id}:${i}`}>{buildChild(id, basePath)}</li>
      ))}
    </ElmList>
  )),

  createComponentImplementation(ListItemApi, ({ props, buildChild }: any) => (
    <>{renderChildList(props.children, buildChild)}</>
  )),

  createComponentImplementation(BlockQuoteApi, ({ props, buildChild }: any) => (
    <ElmBlockQuote cite={props.cite}>
      {renderChildList(props.children, buildChild)}
    </ElmBlockQuote>
  )),

  createComponentImplementation(CalloutApi, ({ props, buildChild }: any) => (
    <ElmCallout type={props.type}>
      {renderChildList(props.children, buildChild)}
    </ElmCallout>
  )),

  createComponentImplementation(DividerApi, () => <ElmDivider />),

  createComponentImplementation(ToggleApi, ({ props, buildChild }: any) => (
    <ElmToggle summary={renderChildList(props.summary, buildChild)}>
      {renderChildList(props.children, buildChild)}
    </ElmToggle>
  )),

  // ----- Media / embed -----
  createComponentImplementation(BookmarkApi, ({ props }: any) => (
    <ElmBookmark
      url={props.url}
      title={props.title}
      description={props.description}
      image={props.image}
    />
  )),

  createComponentImplementation(FileApi, ({ props }: any) => (
    <ElmFile src={props.src} name={props.name} />
  )),

  createComponentImplementation(BlockImageApi, ({ props }: any) => (
    <ElmBlockImage
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      srcSet={props.srcset}
      sizes={props.sizes}
      caption={props.caption}
      enableModal={true}
    />
  )),

  // ----- Code / math / diagram -----
  createComponentImplementation(CodeBlockApi, ({ props }: any) => (
    <ElmCodeBlock
      code={props.code}
      language={props.language}
      caption={props.caption}
    />
  )),

  createComponentImplementation(KatexApi, ({ props }: any) => (
    <ElmKatex expression={props.expression} block={true} />
  )),

  // Mermaid renders as a syntax-highlighted code block — no dedicated Mermaid
  // renderer in this package. The source is preserved for host post-processing.
  createComponentImplementation(MermaidApi, ({ props }: any) => (
    <ElmCodeBlock code={props.code} language="mermaid" />
  )),

  // ----- Tabs (ContentTab is data-only; ContentTabs walks the surface) -----
  createComponentImplementation(ContentTabApi, () => null),

  createComponentImplementation(
    ContentTabsApi,
    ({ props, buildChild, context }: any) => {
      const tabIds = childListIds(props.children);
      const tabs = tabIds.map((tabId) => {
        const tabModel = context.surfaceComponents.get(tabId);
        return {
          tabId,
          labelIds: childListIds(tabModel?.properties.label),
          contentIds: childListIds(tabModel?.properties.content),
        };
      });
      return (
        <ElmTabs defaultValue="0">
          <ElmTabList>
            {tabs.map(({ tabId, labelIds }, idx) => (
              <ElmTab key={tabId} value={String(idx)}>
                {labelIds.map((lid, i) => (
                  <Fragment key={`${lid}:${i}`}>
                    {buildChild(lid, "/")}
                  </Fragment>
                ))}
              </ElmTab>
            ))}
          </ElmTabList>
          {tabs.map(({ tabId, contentIds }, idx) => (
            <ElmTabPanel key={tabId} value={String(idx)}>
              {contentIds.map((cid, i) => (
                <Fragment key={`${cid}:${i}`}>{buildChild(cid, "/")}</Fragment>
              ))}
            </ElmTabPanel>
          ))}
        </ElmTabs>
      );
    },
  ),

  // ----- Table -----
  createComponentImplementation(TableApi, ({ props, buildChild }: any) => (
    <ElmTable
      caption={props.caption ? String(props.caption) : undefined}
      hasRowHeader={props.hasRowHeader}
    >
      {props.header && props.header.length > 0 && (
        <ElmTableHeader>
          {renderChildList(props.header, buildChild)}
        </ElmTableHeader>
      )}
      <ElmTableBody>{renderChildList(props.body, buildChild)}</ElmTableBody>
    </ElmTable>
  )),

  createComponentImplementation(TableRowApi, ({ props, buildChild }: any) => (
    <ElmTableRow>{renderChildList(props.children, buildChild)}</ElmTableRow>
  )),

  createComponentImplementation(TableCellApi, ({ props, buildChild }: any) => (
    <ElmTableCell isHeader={props.isHeader}>
      {renderChildList(props.children, buildChild)}
    </ElmTableCell>
  )),

  // ----- Fallback -----
  createComponentImplementation(UnsupportedApi, ({ props }: any) => (
    <ElmUnsupportedBlock
      details={
        props.details
          ? `Unsupported component type: ${String(props.details)}`
          : "Unsupported component type"
      }
    />
  )),
];
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * The merged component list: the official A2UI basic catalog underneath, with
 * the Elm block implementations layered on top (later entries win by name, so
 * `Column` / `List` / `Divider` / `Icon` resolve to the Elm versions). This is
 * the unit `ElmA2ui` registers under each referenced catalog id.
 */
export const blockComponents: ReactComponentImplementation[] = [
  ...basicCatalog.components.values(),
  ...blockImplementations,
];

/** Shared catalog functions (from the official basic catalog). */
export const blockFunctions = Array.from(basicCatalog.functions.values());

/**
 * A ready-to-use `Catalog` of {@link blockComponents}, registered under the
 * basic-catalog id. `ElmA2ui` rebuilds equivalent catalogs per referenced id;
 * this export is for direct/standalone use.
 */
export const blockCatalog: Catalog<ReactComponentImplementation> = new Catalog(
  BLOCK_CATALOG_ID,
  blockComponents,
  blockFunctions,
);
