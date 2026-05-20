/**
 * "Block" catalog — typography, media, code, math, table, tabs, and a callout
 * fallback. Composes on top of the basic catalog: most layout primitives
 * (Row, Image, etc.) come from `basicCatalog`; this catalog adds richer block
 * elements that wrap project-specific Elm* components.
 */
import { Fragment, type CSSProperties } from "@qwik.dev/core";

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

import { CatalogRenderer, defineRenderer } from "./catalog";
import {
  alignItemsMap,
  firstChildMargin,
  justifyContentMap,
} from "./catalog-utils";
import { basicCatalog } from "./basic-catalog";
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

/**
 * A `ChildList` is either a static array of component ids or a template
 * `{ componentId, path }`. The Tab renderer only renders the static form
 * today; bound templates resolve to no children until the data layer is
 * wired up. Returns the validated string ids.
 */
function extractChildIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

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
 * The block catalog stands on top of the basic catalog. Use it directly
 * (`blockCatalog`) when you want both the basic primitives and the typography
 * block components.
 */
export const blockCatalog: CatalogRenderer = basicCatalog.extend(
  // -------------------------------------------------------------------------
  // Inline components
  // -------------------------------------------------------------------------

  defineRenderer(RichTextApi, ({ props, resolve }) => {
    const text = resolve(props.text);
    const decoration = props.decoration ?? [];
    if (decoration.includes("katex"))
      return <ElmKatex expression={text} block={false} />;
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
        {text}
      </ElmInlineText>
    );
  }),

  defineRenderer(LinkTextApi, ({ props, resolve }) => (
    <ElmInlineText href={props.href} favicon={props.favicon}>
      {resolve(props.text)}
    </ElmInlineText>
  )),

  defineRenderer(IconApi, ({ props, resolve }) => (
    <ElmInlineIcon src={resolve(props.src)} alt={props.alt} />
  )),

  // -------------------------------------------------------------------------
  // Layout (overrides Column from basicCatalog with widthRatio support)
  // -------------------------------------------------------------------------

  defineRenderer(ColumnApi, ({ props, index, childRefs, renderChild }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: justifyContentMap[props.justify ?? "start"],
        alignItems: alignItemsMap[props.align ?? "stretch"],
        flex: props.widthRatio != null ? String(props.widthRatio) : undefined,
        boxSizing: "border-box",
        padding: "0.125rem",
        ...firstChildMargin(index),
      }}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path, i)}</span>
      ))}
    </div>
  )),

  defineRenderer(ColumnListApi, ({ props, index, childRefs, renderChild }) => (
    <div style={{ ...columnListStyle, ...firstChildMargin(index) }}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </div>
  )),

  // -------------------------------------------------------------------------
  // Block typography
  // -------------------------------------------------------------------------

  defineRenderer(HeadingApi, ({ props, index, childRefs, renderChild }) => (
    <ElmHeading level={props.level} style={firstChildMargin(index)}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </ElmHeading>
  )),

  defineRenderer(ParagraphApi, ({ props, index, childRefs, renderChild }) => (
    <ElmParagraph
      color={props.color}
      backgroundColor={props.backgroundColor}
      style={firstChildMargin(index)}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path, i)}</span>
      ))}
    </ElmParagraph>
  )),

  defineRenderer(ListApi, ({ props, index, childRefs, renderChild }) => (
    <ElmList
      listStyle={props.style ?? "unordered"}
      style={firstChildMargin(index)}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <li key={`${id}:${i}`}>{renderChild(id, path, i)}</li>
      ))}
    </ElmList>
  )),

  defineRenderer(ListItemApi, ({ props, childRefs, renderChild }) => (
    <>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </>
  )),

  defineRenderer(BlockQuoteApi, ({ props, index, childRefs, renderChild }) => (
    <ElmBlockQuote cite={props.cite} style={firstChildMargin(index)}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </ElmBlockQuote>
  )),

  defineRenderer(CalloutApi, ({ props, index, childRefs, renderChild }) => (
    <ElmCallout type={props.type} style={firstChildMargin(index)}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </ElmCallout>
  )),

  defineRenderer(DividerApi, ({ index }) => (
    <ElmDivider style={firstChildMargin(index)} />
  )),

  defineRenderer(ToggleApi, ({ props, index, childRefs, renderChild }) => (
    <ElmToggle style={firstChildMargin(index)}>
      <div q:slot="summary">
        {childRefs(props.summary).map(({ id, path }, i) => (
          <span key={`${id}:${i}`}>{renderChild(id, path, i)}</span>
        ))}
      </div>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </ElmToggle>
  )),

  // -------------------------------------------------------------------------
  // Media / embed
  // -------------------------------------------------------------------------

  defineRenderer(BookmarkApi, ({ props, index, resolve }) => (
    <ElmBookmark
      url={resolve(props.url)}
      title={props.title ? resolve(props.title) : undefined}
      description={props.description ? resolve(props.description) : undefined}
      image={props.image ? resolve(props.image) : undefined}
      style={firstChildMargin(index)}
    />
  )),

  defineRenderer(FileApi, ({ props, index, resolve }) => (
    <ElmFile
      src={resolve(props.src)}
      name={props.name ? resolve(props.name) : undefined}
      style={firstChildMargin(index)}
    />
  )),

  defineRenderer(BlockImageApi, ({ props, index, resolve }) => (
    <ElmBlockImage
      src={resolve(props.src)}
      alt={props.alt ? resolve(props.alt) : undefined}
      width={props.width}
      height={props.height}
      srcset={props.srcset ? resolve(props.srcset) : undefined}
      sizes={props.sizes ? resolve(props.sizes) : undefined}
      caption={props.caption ? resolve(props.caption) : undefined}
      enableModal={true}
      style={firstChildMargin(index)}
    />
  )),

  // -------------------------------------------------------------------------
  // Code / math / diagram
  // -------------------------------------------------------------------------

  defineRenderer(CodeBlockApi, ({ props, index, resolve }) => (
    <ElmCodeBlock
      code={resolve(props.code)}
      language={props.language ? resolve(props.language) : undefined}
      caption={props.caption ? resolve(props.caption) : undefined}
      style={firstChildMargin(index)}
    />
  )),

  defineRenderer(KatexApi, ({ props, index, resolve }) => (
    <ElmKatex
      expression={resolve(props.expression)}
      block={true}
      style={firstChildMargin(index)}
    />
  )),

  // Mermaid is rendered as a syntax-highlighted code block — no dedicated
  // Mermaid renderer in this package. The diagram source is preserved so a
  // host application can post-process if needed.
  defineRenderer(MermaidApi, ({ props, index, resolve }) => (
    <ElmCodeBlock
      code={resolve(props.code)}
      language="mermaid"
      style={firstChildMargin(index)}
    />
  )),

  // -------------------------------------------------------------------------
  // Tabs — ContentTab is data-only (its parent ContentTabs walks the surface
  // model to read each tab's label and content ChildList directly).
  // -------------------------------------------------------------------------

  defineRenderer(ContentTabApi, () => null),

  defineRenderer(ContentTabsApi, ({ props, index, surface, renderChild }) => {
    const tabIds = Array.isArray(props.children) ? props.children : [];
    const tabs = tabIds.map((tabId) => {
      const tabModel = surface.componentsModel.get(tabId);
      return {
        tabId,
        labelIds: extractChildIds(tabModel?.properties.label),
        contentIds: extractChildIds(tabModel?.properties.content),
      };
    });
    return (
      <ElmTabs defaultValue="0" style={firstChildMargin(index)}>
        <ElmTabList>
          {tabs.map(({ tabId, labelIds }, idx) => (
            <ElmTab key={tabId} value={String(idx)}>
              {labelIds.map((lid, i) => (
                <Fragment key={`${lid}:${i}`}>
                  {renderChild(lid, "/", i)}
                </Fragment>
              ))}
            </ElmTab>
          ))}
        </ElmTabList>
        {tabs.map(({ tabId, contentIds }, idx) => (
          <ElmTabPanel key={tabId} value={String(idx)}>
            {contentIds.map((cid, i) => (
              <Fragment key={`${cid}:${i}`}>
                {renderChild(cid, "/", i)}
              </Fragment>
            ))}
          </ElmTabPanel>
        ))}
      </ElmTabs>
    );
  }),

  // -------------------------------------------------------------------------
  // Table
  // -------------------------------------------------------------------------

  defineRenderer(TableApi, ({ props, index, childRefs, renderChild }) => (
    <ElmTable
      caption={props.caption ? String(props.caption) : undefined}
      hasRowHeader={props.hasRowHeader}
      style={firstChildMargin(index)}
    >
      {props.header && props.header.length > 0 && (
        <ElmTableHeader>
          {childRefs(props.header).map(({ id, path }, i) => (
            <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
          ))}
        </ElmTableHeader>
      )}
      <ElmTableBody>
        {childRefs(props.body).map(({ id, path }, i) => (
          <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
        ))}
      </ElmTableBody>
    </ElmTable>
  )),

  defineRenderer(TableRowApi, ({ props, childRefs, renderChild }) => (
    <ElmTableRow>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path, i)}</Fragment>
      ))}
    </ElmTableRow>
  )),

  defineRenderer(TableCellApi, ({ props, index, childRefs, renderChild }) => (
    <ElmTableCell isHeader={props.isHeader} columnIndex={index}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path, i)}</span>
      ))}
    </ElmTableCell>
  )),

  // -------------------------------------------------------------------------
  // Fallback
  // -------------------------------------------------------------------------

  defineRenderer(UnsupportedApi, ({ props, index }) => (
    <ElmUnsupportedBlock
      details={
        props.details
          ? `Unsupported component type: ${String(props.details)}`
          : "Unsupported component type"
      }
      style={firstChildMargin(index)}
    />
  )),
);
