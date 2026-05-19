import { z } from "zod";

import {
  AccessibilityAttributesSchema,
  type ComponentApi,
  DynamicStringSchema,
} from "@a2ui/web_core/v0_9";

const CommonProps = {
  accessibility: AccessibilityAttributesSchema.optional(),
  weight: z
    .number()
    .describe(
      "The relative weight of this component within a Row or Column. This is similar to the CSS 'flex-grow' property. Note: this may ONLY be set when the component is a direct descendant of a Row or Column.",
    )
    .optional(),
};

/** Reusable children schema: static array of component IDs or a list template. */
const childrenSchema = z.union([
  z.array(z.string()),
  z.object({ componentId: z.string(), path: z.string() }),
]);

// ---------------------------------------------------------------------------
// Inline components
// ---------------------------------------------------------------------------

export const RichTextApi = {
  name: "RichText",
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema.describe("The text content to display."),
      decoration: z
        .array(
          z.enum([
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "code",
            "katex",
          ]),
        )
        .describe("Text decorations to apply.")
        .optional(),
      ruby: z.string().describe("Ruby annotation text.").optional(),
      color: z
        .string()
        .describe("Text color (e.g. '#ff0000' or 'red').")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const LinkTextApi = {
  name: "LinkText",
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema.describe("The visible link text."),
      href: z.string().describe("The URL to link to."),
      favicon: z
        .string()
        .describe("The URL of the favicon to show before the text.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

/** Inline image icon. Renders a small image inline with text. */
export const IconApi = {
  name: "Icon",
  schema: z
    .object({
      ...CommonProps,
      src: z.string().describe("The source URL of the icon image."),
      alt: z.string().describe("Accessible alt text for the icon.").optional(),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Layout primitives (re-exported from the basic catalog)
// ---------------------------------------------------------------------------

import { RowApi } from "@a2ui/web_core/v0_9/basic_catalog";
export { RowApi };

/**
 * Vertical stack container. Extends the basic Column with an optional
 * `widthRatio` for use inside a `ColumnList`.
 */
export const ColumnApi = {
  name: "Column",
  schema: z
    .object({
      ...CommonProps,
      children: childrenSchema.describe("Ordered list of child component IDs."),
      justify: z
        .enum([
          "start",
          "end",
          "center",
          "spaceBetween",
          "spaceAround",
          "spaceEvenly",
          "stretch",
        ])
        .describe("Justify-content alignment for children.")
        .optional(),
      align: z
        .enum(["start", "end", "center", "stretch"])
        .describe("Align-items alignment for children.")
        .optional(),
      widthRatio: z
        .number()
        .describe(
          "Relative flex width of this column when inside a ColumnList. Defaults to 1.",
        )
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

/** Horizontal multi-column layout container. Children must be Column components. */
export const ColumnListApi = {
  name: "ColumnList",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .array(z.string())
        .describe("Ordered list of Column component IDs."),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Block typography
// ---------------------------------------------------------------------------

export const HeadingApi = {
  name: "Heading",
  schema: z
    .object({
      ...CommonProps,
      level: z
        .union([
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
          z.literal(6),
        ])
        .describe("Heading level 1–6, maps to h1–h6."),
      children: childrenSchema.describe(
        "Ordered list of inline component IDs (RichText, LinkText, Icon, etc.) that form the heading text.",
      ),
    })
    .strict(),
} satisfies ComponentApi;

export const ParagraphApi = {
  name: "Paragraph",
  schema: z
    .object({
      ...CommonProps,
      children: childrenSchema.describe(
        "Ordered list of inline component IDs (RichText, LinkText, etc.), or a list template.",
      ),
      color: z
        .string()
        .describe("Text color applied to the paragraph.")
        .optional(),
      backgroundColor: z
        .string()
        .describe("Background color applied to the paragraph.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ListApi = {
  name: "List",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .array(z.string())
        .describe("Ordered list of ListItem component IDs."),
      style: z
        .enum(["unordered", "ordered"])
        .default("unordered")
        .describe("The list style: bullet points or numbered.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ListItemApi = {
  name: "ListItem",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .array(z.string())
        .describe("Ordered list of child component IDs inside this list item."),
    })
    .strict(),
} satisfies ComponentApi;

export const BlockQuoteApi = {
  name: "BlockQuote",
  schema: z
    .object({
      ...CommonProps,
      cite: z
        .string()
        .describe("Optional citation URL for the quoted source.")
        .optional(),
      children: childrenSchema.describe(
        "Ordered list of child component IDs that make up the quote body.",
      ),
    })
    .strict(),
} satisfies ComponentApi;

export const CalloutApi = {
  name: "Callout",
  schema: z
    .object({
      ...CommonProps,
      type: z
        .enum(["note", "tip", "important", "warning", "caution"])
        .describe(
          "Callout severity/type. Determines the icon and accent color.",
        )
        .optional(),
      children: childrenSchema.describe(
        "Ordered list of child component IDs that make up the callout body.",
      ),
    })
    .strict(),
} satisfies ComponentApi;

/** Horizontal rule / section separator. Has no configurable properties. */
export const DividerApi = {
  name: "Divider",
  schema: z
    .object({
      ...CommonProps,
    })
    .strict(),
} satisfies ComponentApi;

/** Collapsible disclosure widget with a clickable summary. */
export const ToggleApi = {
  name: "Toggle",
  schema: z
    .object({
      ...CommonProps,
      summary: childrenSchema.describe(
        "Ordered list of inline component IDs that form the visible toggle label.",
      ),
      children: childrenSchema.describe(
        "Ordered list of component IDs shown when the toggle is expanded.",
      ),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Media / embed
// ---------------------------------------------------------------------------

/** URL bookmark card showing title, description, and OGP image. */
export const BookmarkApi = {
  name: "Bookmark",
  schema: z
    .object({
      ...CommonProps,
      url: z.string().describe("The URL the bookmark links to."),
      title: z
        .string()
        .describe("Display title of the bookmarked page.")
        .optional(),
      description: z
        .string()
        .describe("Short description or excerpt of the page.")
        .optional(),
      image: z
        .string()
        .describe("URL of the OGP/thumbnail image for the bookmark.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

/** Downloadable file attachment widget. */
export const FileApi = {
  name: "File",
  schema: z
    .object({
      ...CommonProps,
      src: z.string().describe("The source URL of the file to download."),
      name: z
        .string()
        .describe("Human-readable display name for the file.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

/**
 * Block-level image with optional caption and modal zoom.
 * Uses `src` (not `url`) to distinguish it from the basic catalog Image.
 */
export const BlockImageApi = {
  name: "BlockImage",
  schema: z
    .object({
      ...CommonProps,
      src: z.string().describe("The source URL of the image."),
      alt: z.string().describe("Accessible alt text for the image.").optional(),
      width: z.number().describe("Intrinsic image width in pixels.").optional(),
      height: z
        .number()
        .describe("Intrinsic image height in pixels.")
        .optional(),
      srcset: z
        .string()
        .describe("srcset attribute for responsive images.")
        .optional(),
      sizes: z
        .string()
        .describe("sizes attribute for responsive images.")
        .optional(),
      caption: z
        .string()
        .describe("Optional caption shown below the image.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Code / math / diagram
// ---------------------------------------------------------------------------

export const CodeBlockApi = {
  name: "CodeBlock",
  schema: z
    .object({
      ...CommonProps,
      code: z.string().describe("The source code content to display."),
      language: z
        .string()
        .describe(
          "The programming language of the code block, used for syntax highlighting (e.g. 'typescript', 'python').",
        )
        .optional(),
      caption: z
        .string()
        .describe("An optional caption displayed above the code block.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

/** Block-level KaTeX math expression rendered in display mode. */
export const KatexApi = {
  name: "Katex",
  schema: z
    .object({
      ...CommonProps,
      expression: z
        .string()
        .describe("The KaTeX/LaTeX expression to render in display mode."),
    })
    .strict(),
} satisfies ComponentApi;

/** Mermaid diagram rendered from its definition string. */
export const MermaidApi = {
  name: "Mermaid",
  schema: z
    .object({
      ...CommonProps,
      code: z
        .string()
        .describe("The Mermaid diagram definition string to render."),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

/**
 * A single tab inside a ContentTabs container.
 * The `labels` list holds inline component IDs for the tab button label;
 * `contents` holds block component IDs for the tab panel body.
 */
export const ContentTabApi = {
  name: "ContentTab",
  schema: z
    .object({
      ...CommonProps,
      title: z
        .string()
        .describe(
          "Accessible title for the tab (also used as fallback label text).",
        )
        .optional(),
      labels: z
        .array(z.string())
        .describe(
          "Ordered list of inline component IDs that render the tab button label.",
        ),
      contents: z
        .array(z.string())
        .describe(
          "Ordered list of component IDs that render the tab panel content.",
        ),
    })
    .strict(),
} satisfies ComponentApi;

/** Tabbed container. Children must be ContentTab components. */
export const ContentTabsApi = {
  name: "ContentTabs",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .array(z.string())
        .describe("Ordered list of ContentTab component IDs."),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export const TableApi = {
  name: "Table",
  schema: z
    .object({
      ...CommonProps,
      body: z
        .array(z.string())
        .describe("Ordered list of TableRow component IDs for the table body."),
      header: z
        .array(z.string())
        .describe(
          "Optional ordered list of TableRow component IDs for the table header.",
        )
        .optional(),
      caption: z
        .string()
        .describe("Optional table caption displayed above or below the table.")
        .optional(),
      hasColumnHeader: z
        .boolean()
        .describe(
          "When true, the cells in the first column are treated as row-header (<th>) cells. Use this when each row has a leading label cell (e.g. a property name in a comparison table).",
        )
        .optional(),
      hasRowHeader: z
        .boolean()
        .describe("When true, the table has a dedicated header row section.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const TableRowApi = {
  name: "TableRow",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .array(z.string())
        .describe("Ordered list of TableCell component IDs in this row."),
    })
    .strict(),
} satisfies ComponentApi;

export const TableCellApi = {
  name: "TableCell",
  schema: z
    .object({
      ...CommonProps,
      children: z
        .array(z.string())
        .describe(
          "Ordered list of inline component IDs that make up the cell content.",
        ),
      isHeader: z
        .boolean()
        .describe(
          "When true, this cell renders as a <th> header cell instead of a <td>.",
        )
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

/** Placeholder rendered when an unsupported component type is encountered. */
export const UnsupportedApi = {
  name: "Unsupported",
  schema: z
    .object({
      ...CommonProps,
      details: z
        .string()
        .describe("Human-readable details about the unsupported component.")
        .optional(),
    })
    .strict(),
} satisfies ComponentApi;
