import { z } from "zod";
import { Fragment, type CSSProperties } from "@builder.io/qwik";
import { ElmKatex } from "../../code/elm-katex";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { ElmInlineIcon } from "../../icon/elm-inline-icon";
import { ElmHeading } from "../../typography/elm-heading";
import { ElmParagraph } from "../../typography/elm-paragraph";
import { ElmList } from "../../typography/elm-list";
import { ElmBlockQuote } from "../../typography/elm-block-quote";
import { ElmCallout } from "../../typography/elm-callout";
import { ElmDivider } from "../../typography/elm-divider";
import { ElmToggle } from "../../containments/elm-toggle";
import { ElmBookmark } from "../../navigation/elm-bookmark";
import { ElmFile } from "../../media/elm-file";
import { ElmBlockImage } from "../../media/elm-block-image";
import { ElmCodeBlock } from "../../code/elm-code-block";
import {
  ElmTable,
  ElmTableHeader,
  ElmTableBody,
  ElmTableRow,
  ElmTableCell,
} from "../../table";
import { ElmTabs } from "../../containments/elm-tabs";
import { ElmUnsupportedBlock } from "../../fallback/elm-unsupported-block";
import {
  CatalogRendererMap,
  RenderContext,
} from "../elm-a2ui-catalog-renderer";
import {
  BlockImageApi,
  BlockQuoteApi,
  BookmarkApi,
  CalloutApi,
  CodeBlockApi,
  ColumnApi,
  ColumnListApi,
  ContentTabsApi,
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
} from "./n2ui-components-definition";
import { elmBasicCatalogRendererMap } from "../elm-a2ui-basic-catalog-renderer";

type Props<T extends { schema: z.ZodTypeAny }> = z.infer<T["schema"]>;
type Ctx<T extends { schema: z.ZodTypeAny }> = RenderContext<Props<T>>;

// ---------------------------------------------------------------------------
// CSS helpers (mirrors elm-jarkup.module.scss layout)
// ---------------------------------------------------------------------------

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

// Maps A2UI `justify` values to CSS `justify-content`.
const jc: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
  stretch: "stretch",
};

// Maps A2UI `align` values to CSS `align-items`.
const ai: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
};

export const elmN2UICatalogRendererMap: CatalogRendererMap<
  | "RichText"
  | "LinkText"
  | "Icon"
  | "Row"
  | "Column"
  | "ColumnList"
  | "Heading"
  | "Paragraph"
  | "List"
  | "ListItem"
  | "BlockQuote"
  | "Callout"
  | "Divider"
  | "Toggle"
  | "Bookmark"
  | "File"
  | "BlockImage"
  | "CodeBlock"
  | "Katex"
  | "Mermaid"
  | "ContentTab"
  | "ContentTabs"
  | "Table"
  | "TableRow"
  | "TableCell"
  | "Unsupported"
> = {
  // -------------------------------------------------------------------------
  // Inline components
  // -------------------------------------------------------------------------

  RichText: ({ props, resolve }: Ctx<typeof RichTextApi>) => {
    const text = resolve(props.text);
    const katex = props.decoration?.includes("katex");

    if (katex) {
      return <ElmKatex expression={text} block={false} />;
    }

    return (
      <ElmInlineText
        bold={props.decoration?.includes("bold")}
        italic={props.decoration?.includes("italic")}
        underline={props.decoration?.includes("underline")}
        strikethrough={props.decoration?.includes("strikethrough")}
        code={props.decoration?.includes("code")}
        color={props.color}
        ruby={props.ruby}
      >
        {text}
      </ElmInlineText>
    );
  },

  LinkText: ({ props, resolve }: Ctx<typeof LinkTextApi>) => (
    <ElmInlineText href={props.href} favicon={props.favicon}>
      {resolve(props.text)}
    </ElmInlineText>
  ),

  Icon: ({ props, resolve }: Ctx<typeof IconApi>) => (
    <ElmInlineIcon src={resolve(props.src)} alt={props.alt} />
  ),

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  Row: elmBasicCatalogRendererMap.Row,

  Column: ({ props, childRefs, renderChild }: Ctx<typeof ColumnApi>) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: jc[props.justify ?? "start"] ?? "flex-start",
        alignItems: ai[props.align ?? "stretch"] ?? "stretch",
        flex: props.widthRatio != null ? String(props.widthRatio) : undefined,
        boxSizing: "border-box",
        padding: "0.125rem",
      }}
    >
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path)}</span>
      ))}
    </div>
  ),

  ColumnList: ({ props, childRefs, renderChild }: Ctx<typeof ColumnListApi>) => (
    <div style={columnListStyle}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </div>
  ),

  // -------------------------------------------------------------------------
  // Block typography
  // -------------------------------------------------------------------------

  Heading: ({ props, childRefs, renderChild }: Ctx<typeof HeadingApi>) => (
    <ElmHeading level={props.level}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </ElmHeading>
  ),

  Paragraph: ({ props, childRefs, renderChild }: Ctx<typeof ParagraphApi>) => (
    <ElmParagraph color={props.color} backgroundColor={props.backgroundColor}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path)}</span>
      ))}
    </ElmParagraph>
  ),

  List: ({ props, childRefs, renderChild }: Ctx<typeof ListApi>) => (
    <ElmList listStyle={props.style ?? "unordered"}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <li key={`${id}:${i}`}>{renderChild(id, path)}</li>
      ))}
    </ElmList>
  ),

  ListItem: ({ props, childRefs, renderChild }: Ctx<typeof ListItemApi>) => (
    <>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </>
  ),

  BlockQuote: ({ props, childRefs, renderChild }: Ctx<typeof BlockQuoteApi>) => (
    <ElmBlockQuote cite={props.cite}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </ElmBlockQuote>
  ),

  Callout: ({ props, childRefs, renderChild }: Ctx<typeof CalloutApi>) => (
    <ElmCallout type={props.type}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </ElmCallout>
  ),

  Divider: () => <ElmDivider />,

  Toggle: ({ props, childRefs, renderChild }: Ctx<typeof ToggleApi>) => (
    <ElmToggle>
      <div q:slot="summary">
        {childRefs(props.summary).map(({ id, path }, i) => (
          <span key={`${id}:${i}`}>{renderChild(id, path)}</span>
        ))}
      </div>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </ElmToggle>
  ),

  // -------------------------------------------------------------------------
  // Media / embed
  // -------------------------------------------------------------------------

  Bookmark: ({ props, resolve }: Ctx<typeof BookmarkApi>) => (
    <ElmBookmark
      url={resolve(props.url)}
      title={props.title ? resolve(props.title) : undefined}
      description={props.description ? resolve(props.description) : undefined}
      image={props.image ? resolve(props.image) : undefined}
    />
  ),

  File: ({ props, resolve }: Ctx<typeof FileApi>) => (
    <ElmFile
      src={resolve(props.src)}
      name={props.name ? resolve(props.name) : undefined}
    />
  ),

  BlockImage: ({ props, resolve }: Ctx<typeof BlockImageApi>) => (
    <ElmBlockImage
      src={resolve(props.src)}
      alt={props.alt ? resolve(props.alt) : undefined}
      width={props.width}
      height={props.height}
      srcset={props.srcset ? resolve(props.srcset) : undefined}
      sizes={props.sizes ? resolve(props.sizes) : undefined}
      caption={props.caption ? resolve(props.caption) : undefined}
      enableModal={true}
    />
  ),

  // -------------------------------------------------------------------------
  // Code / math / diagram
  // -------------------------------------------------------------------------

  CodeBlock: ({ props, resolve }: Ctx<typeof CodeBlockApi>) => (
    <ElmCodeBlock
      code={resolve(props.code)}
      language={props.language ? resolve(props.language) : undefined}
      caption={props.caption ? resolve(props.caption) : undefined}
    />
  ),

  Katex: ({ props, resolve }: Ctx<typeof KatexApi>) => (
    <ElmKatex expression={resolve(props.expression)} block={true} />
  ),

  /**
   * Mermaid diagrams are rendered as a syntax-highlighted code block since
   * there is no dedicated Mermaid renderer in this package. The diagram
   * definition string is fully preserved so a host application can post-process
   * the output if needed.
   */
  Mermaid: ({ props, resolve }: Ctx<typeof MermaidApi>) => (
    <ElmCodeBlock code={resolve(props.code)} language="mermaid" />
  ),

  // -------------------------------------------------------------------------
  // Tabs
  // -------------------------------------------------------------------------

  /**
   * ContentTab is a data-only component. It is not rendered directly —
   * ContentTabs accesses Tab models from the surface and renders them as a
   * tabbed panel. Returning null here prevents double-rendering.
   */
  ContentTab: () => null,

  ContentTabs: ({
    props,
    surface,
    basePath,
    renderChild,
  }: Ctx<typeof ContentTabsApi>) => {
    const tabIds = Array.isArray(props.children)
      ? (props.children as string[])
      : [];

    const tabLabels = tabIds.map((tabId) => {
      const tabModel = surface.componentsModel.get(tabId);
      if (!tabModel) return null;
      const rawLabels = tabModel.properties.labels;
      const labelIds = Array.isArray(rawLabels)
        ? rawLabels.filter((id): id is string => typeof id === "string")
        : [];
      return (
        <>
          {labelIds.map((lid, i) => (
            <Fragment key={`${lid}:${i}`}>{renderChild(lid, basePath)}</Fragment>
          ))}
        </>
      );
    });

    const tabContents = tabIds.map((tabId) => {
      const tabModel = surface.componentsModel.get(tabId);
      if (!tabModel) return null;
      const rawContents = tabModel.properties.contents;
      const contentIds = Array.isArray(rawContents)
        ? rawContents.filter((id): id is string => typeof id === "string")
        : [];
      return (
        <>
          {contentIds.map((cid, i) => (
            <Fragment key={`${cid}:${i}`}>{renderChild(cid, basePath)}</Fragment>
          ))}
        </>
      );
    });

    return <ElmTabs tabLabels={tabLabels} tabContents={tabContents} />;
  },

  // -------------------------------------------------------------------------
  // Table
  // -------------------------------------------------------------------------

  Table: ({ props, childRefs, renderChild }: Ctx<typeof TableApi>) => (
    <ElmTable
      caption={props.caption ? String(props.caption) : undefined}
      hasRowHeader={props.hasRowHeader}
    >
      {props.header && props.header.length > 0 && (
        <ElmTableHeader>
          {childRefs(props.header).map(({ id, path }, i) => (
            <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
          ))}
        </ElmTableHeader>
      )}
      <ElmTableBody>
        {childRefs(props.body).map(({ id, path }, i) => (
          <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
        ))}
      </ElmTableBody>
    </ElmTable>
  ),

  TableRow: ({ props, childRefs, renderChild }: Ctx<typeof TableRowApi>) => (
    <ElmTableRow>
      {childRefs(props.children).map(({ id, path }, i) => (
        <Fragment key={`${id}:${i}`}>{renderChild(id, path)}</Fragment>
      ))}
    </ElmTableRow>
  ),

  TableCell: ({ props, childRefs, renderChild }: Ctx<typeof TableCellApi>) => (
    <ElmTableCell hasHeader={props.isHeader}>
      {childRefs(props.children).map(({ id, path }, i) => (
        <span key={`${id}:${i}`}>{renderChild(id, path)}</span>
      ))}
    </ElmTableCell>
  ),

  // -------------------------------------------------------------------------
  // Fallback
  // -------------------------------------------------------------------------

  Unsupported: ({ props }: Ctx<typeof UnsupportedApi>) => (
    <ElmUnsupportedBlock
      details={
        props.details
          ? `Unsupported component type: ${String(props.details)}`
          : "Unsupported component type"
      }
    />
  ),
};
