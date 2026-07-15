import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmA2ui } from "../elm-a2ui";
import { notionBlockCatalog } from "./notion-block-catalog";

// One story per notion-block-catalog component type, mirroring the qwik
// reference (`notion-block-catalog.stories.tsx`) 1:1 so all three frameworks
// exercise the same A2UI surfaces.
const meta = {
  title: "Components/A2UI/Catalog/notion-block-catalog",
  component: ElmA2ui,
  tags: ["autodocs"],
  args: { catalog: notionBlockCatalog },
} satisfies Meta<typeof ElmA2ui>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const surface = (components: object[]): object[] => [
  { version: "v0.9", createSurface: { surfaceId: "s", catalogId: CATALOG_ID } },
  { version: "v0.9", updateComponents: { surfaceId: "s", components } },
];

// ---------------------------------------------------------------------------
// Inline text
// ---------------------------------------------------------------------------

export const RichText: Story = {
  args: {
    messages: surface([
      {
        component: "Column",
        id: "root",
        children: ["p1", "p2"],
      },
      {
        component: "Paragraph",
        id: "p1",
        children: ["t1", "t2", "t3"],
      },
      { component: "RichText", id: "t1", text: "Hello, " },
      {
        component: "RichText",
        id: "t2",
        text: "world!",
        decoration: ["bold"],
      },
      {
        component: "RichText",
        id: "t3",
        text: " (italic)",
        decoration: ["italic"],
      },
      {
        component: "Paragraph",
        id: "p2",
        children: ["t4", "t5", "t6"],
      },
      { component: "RichText", id: "t4", text: "Inline " },
      {
        component: "RichText",
        id: "t5",
        text: "code",
        decoration: ["code"],
      },
      {
        component: "LinkText",
        id: "t6",
        text: " A2UI",
        href: "https://a2ui.org/",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export const Headings: Story = {
  args: {
    messages: surface([
      {
        component: "Column",
        id: "root",
        children: ["h1", "h2", "h3"],
      },
      {
        component: "Heading",
        id: "h1",
        level: 1,
        children: ["h1-text"],
      },
      { component: "RichText", id: "h1-text", text: "Heading Level 1" },
      {
        component: "Heading",
        id: "h2",
        level: 2,
        children: ["h2-text"],
      },
      { component: "RichText", id: "h2-text", text: "Heading Level 2" },
      {
        component: "Heading",
        id: "h3",
        level: 3,
        children: ["h3-text"],
      },
      { component: "RichText", id: "h3-text", text: "Heading Level 3" },
    ]),
  },
};

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const List: Story = {
  args: {
    messages: surface([
      {
        component: "List",
        id: "root",
        style: "unordered",
        children: ["li1", "li2"],
      },
      {
        component: "ListItem",
        id: "li1",
        children: ["li1-t1", "li1-t2"],
      },
      { component: "RichText", id: "li1-t1", text: "First item — " },
      {
        component: "RichText",
        id: "li1-t2",
        text: "bold",
        decoration: ["bold"],
      },
      {
        component: "ListItem",
        id: "li2",
        children: ["li2-t1"],
      },
      { component: "RichText", id: "li2-t1", text: "Second item" },
    ]),
  },
};

// ---------------------------------------------------------------------------
// NestedList
// ---------------------------------------------------------------------------

export const NestedList: Story = {
  args: {
    messages: surface([
      {
        component: "List",
        id: "root",
        style: "unordered",
        children: ["li1", "li2", "li3"],
      },
      {
        component: "ListItem",
        id: "li1",
        children: ["li1-t", "li1-sub"],
      },
      { component: "RichText", id: "li1-t", text: "Fruits" },
      {
        component: "List",
        id: "li1-sub",
        style: "unordered",
        children: ["li1-sub-1", "li1-sub-2"],
      },
      {
        component: "ListItem",
        id: "li1-sub-1",
        children: ["li1-sub-1-t"],
      },
      { component: "RichText", id: "li1-sub-1-t", text: "Apple" },
      {
        component: "ListItem",
        id: "li1-sub-2",
        children: ["li1-sub-2-t"],
      },
      { component: "RichText", id: "li1-sub-2-t", text: "Banana" },
      {
        component: "ListItem",
        id: "li2",
        children: ["li2-t", "li2-sub"],
      },
      { component: "RichText", id: "li2-t", text: "Steps" },
      {
        component: "List",
        id: "li2-sub",
        style: "ordered",
        children: ["li2-sub-1", "li2-sub-2"],
      },
      {
        component: "ListItem",
        id: "li2-sub-1",
        children: ["li2-sub-1-t"],
      },
      { component: "RichText", id: "li2-sub-1-t", text: "Preheat oven" },
      {
        component: "ListItem",
        id: "li2-sub-2",
        children: ["li2-sub-2-t"],
      },
      { component: "RichText", id: "li2-sub-2-t", text: "Mix batter" },
      {
        component: "ListItem",
        id: "li3",
        children: ["li3-t"],
      },
      { component: "RichText", id: "li3-t", text: "Flat item" },
    ]),
  },
};

// ---------------------------------------------------------------------------
// BlockQuote
// ---------------------------------------------------------------------------

export const BlockQuote: Story = {
  args: {
    messages: surface([
      {
        component: "BlockQuote",
        id: "root",
        cite: "https://example.com",
        children: ["bq-p"],
      },
      {
        component: "Paragraph",
        id: "bq-p",
        children: ["bq-t"],
      },
      {
        component: "RichText",
        id: "bq-t",
        text: "To be, or not to be, that is the question.",
      },
    ]),
  },
};

export const BlockQuoteInlineRichText: Story = {
  args: {
    messages: surface([
      {
        component: "BlockQuote",
        id: "root",
        children: ["t1", "t2", "t3", "t4", "t5", "t6", "t7"],
      },
      { component: "RichText", id: "t1", text: "Could you " },
      {
        component: "RichText",
        id: "t2",
        text: "look",
        color: "#b8a36e",
        decoration: ["bold", "underline"],
      },
      { component: "RichText", id: "t3", text: " " },
      {
        component: "RichText",
        id: "t4",
        text: "into",
        color: "#b8a36e",
        decoration: ["bold", "underline"],
      },
      {
        component: "RichText",
        id: "t5",
        text: " whether there's any way to make this ",
      },
      {
        component: "RichText",
        id: "t6",
        text: "happen",
        color: "#b8a36e",
        decoration: ["bold", "underline"],
      },
      { component: "RichText", id: "t7", text: "?" },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Callout
// ---------------------------------------------------------------------------

export const Callout: Story = {
  args: {
    messages: surface([
      {
        component: "Column",
        id: "root",
        children: ["note", "warning", "tip"],
      },
      {
        component: "Callout",
        id: "note",
        type: "note",
        children: ["note-p"],
      },
      {
        component: "Paragraph",
        id: "note-p",
        children: ["note-t"],
      },
      {
        component: "RichText",
        id: "note-t",
        text: "This is a note callout.",
      },
      {
        component: "Callout",
        id: "warning",
        type: "warning",
        children: ["warn-p"],
      },
      {
        component: "Paragraph",
        id: "warn-p",
        children: ["warn-t"],
      },
      {
        component: "RichText",
        id: "warn-t",
        text: "This is a warning callout.",
      },
      {
        component: "Callout",
        id: "tip",
        type: "tip",
        children: ["tip-p"],
      },
      {
        component: "Paragraph",
        id: "tip-p",
        children: ["tip-t"],
      },
      {
        component: "RichText",
        id: "tip-t",
        text: "This is a tip callout.",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

export const Divider: Story = {
  args: {
    messages: surface([
      {
        component: "Column",
        id: "root",
        children: ["p1", "div1", "p2"],
      },
      {
        component: "Paragraph",
        id: "p1",
        children: ["t1"],
      },
      { component: "RichText", id: "t1", text: "Above the divider" },
      { component: "Divider", id: "div1" },
      {
        component: "Paragraph",
        id: "p2",
        children: ["t2"],
      },
      { component: "RichText", id: "t2", text: "Below the divider" },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

export const Toggle: Story = {
  args: {
    messages: surface([
      {
        component: "Toggle",
        id: "root",
        summary: ["summary-t"],
        children: ["body-p"],
      },
      { component: "RichText", id: "summary-t", text: "Click to expand" },
      {
        component: "Paragraph",
        id: "body-p",
        children: ["body-t"],
      },
      {
        component: "RichText",
        id: "body-t",
        text: "This content is revealed when the toggle is open.",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Bookmark
// ---------------------------------------------------------------------------

export const Bookmark: Story = {
  args: {
    messages: surface([
      {
        component: "Bookmark",
        id: "root",
        url: "https://a2ui.org/",
        title: "A2UI — Agent-to-UI Protocol",
        description:
          "A standard protocol for AI agents to declaratively control UI surfaces.",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// File
// ---------------------------------------------------------------------------

export const File: Story = {
  args: {
    messages: surface([
      {
        component: "File",
        id: "root",
        src: "https://example.com/document.pdf",
        name: "document.pdf",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export const Audio: Story = {
  args: {
    messages: surface([
      {
        component: "Audio",
        id: "root",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        title: "Midnight Reverie",
        artist: "SoundHelix",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

export const Video: Story = {
  args: {
    messages: surface([
      {
        component: "Video",
        id: "root",
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        poster:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        caption: "Big Buck Bunny — a sample video clip",
        width: 640,
        height: 360,
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// BlockImage
// ---------------------------------------------------------------------------

export const BlockImage: Story = {
  args: {
    messages: surface([
      {
        component: "BlockImage",
        id: "root",
        src: "https://placehold.co/600x400",
        alt: "Placeholder image",
        caption: "A sample placeholder image",
        width: 600,
        height: 400,
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Html
// ---------------------------------------------------------------------------

export const Html: Story = {
  args: {
    messages: surface([
      {
        component: "Html",
        id: "root",
        html: '<!doctype html><html><body style="font-family: sans-serif; margin: 0; padding: 1rem;"><h1>Hello from an iframe</h1><p>This markup is rendered inside a sandboxed <code>&lt;iframe&gt;</code>.</p></body></html>',
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// CodeBlock
// ---------------------------------------------------------------------------

export const CodeBlock: Story = {
  args: {
    messages: surface([
      {
        component: "CodeBlock",
        id: "root",
        code: `function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}`,
        language: "typescript",
        caption: "Example TypeScript function",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Katex
// ---------------------------------------------------------------------------

export const Katex: Story = {
  args: {
    messages: surface([
      {
        component: "Katex",
        id: "root",
        expression: "E = mc^2",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Mermaid (rendered as code block)
// ---------------------------------------------------------------------------

export const Mermaid: Story = {
  args: {
    messages: surface([
      {
        component: "Mermaid",
        id: "root",
        code: "graph TD;\n  A-->B;\n  A-->C;\n  B-->D;\n  C-->D;",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// ContentTabs
// ---------------------------------------------------------------------------

export const ContentTabs: Story = {
  args: {
    messages: surface([
      {
        component: "ContentTabs",
        id: "root",
        children: ["tab1", "tab2"],
      },
      {
        component: "ContentTab",
        id: "tab1",
        label: ["tab1-label"],
        content: ["tab1-body"],
      },
      { component: "RichText", id: "tab1-label", text: "First" },
      {
        component: "Paragraph",
        id: "tab1-body",
        children: ["tab1-t"],
      },
      {
        component: "RichText",
        id: "tab1-t",
        text: "Content of the first tab.",
      },
      {
        component: "ContentTab",
        id: "tab2",
        label: ["tab2-label"],
        content: ["tab2-body"],
      },
      { component: "RichText", id: "tab2-label", text: "Second" },
      {
        component: "Paragraph",
        id: "tab2-body",
        children: ["tab2-t"],
      },
      {
        component: "RichText",
        id: "tab2-t",
        text: "Content of the second tab.",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export const Table: Story = {
  args: {
    messages: surface([
      {
        component: "Table",
        id: "root",
        caption: "Monthly sales",
        hasRowHeader: true,
        header: ["header-row"],
        body: ["row1", "row2"],
      },
      {
        component: "TableRow",
        id: "header-row",
        children: ["hcell1", "hcell2", "hcell3"],
      },
      {
        component: "TableCell",
        id: "hcell1",
        isHeader: true,
        children: ["hcell1-t"],
      },
      { component: "RichText", id: "hcell1-t", text: "Month" },
      {
        component: "TableCell",
        id: "hcell2",
        isHeader: true,
        children: ["hcell2-t"],
      },
      { component: "RichText", id: "hcell2-t", text: "Revenue" },
      {
        component: "TableCell",
        id: "hcell3",
        isHeader: true,
        children: ["hcell3-t"],
      },
      { component: "RichText", id: "hcell3-t", text: "Units" },
      {
        component: "TableRow",
        id: "row1",
        children: ["r1c1", "r1c2", "r1c3"],
      },
      {
        component: "TableCell",
        id: "r1c1",
        children: ["r1c1-t"],
      },
      { component: "RichText", id: "r1c1-t", text: "January" },
      {
        component: "TableCell",
        id: "r1c2",
        children: ["r1c2-t"],
      },
      { component: "RichText", id: "r1c2-t", text: "$10,000" },
      {
        component: "TableCell",
        id: "r1c3",
        children: ["r1c3-t"],
      },
      { component: "RichText", id: "r1c3-t", text: "120" },
      {
        component: "TableRow",
        id: "row2",
        children: ["r2c1", "r2c2", "r2c3"],
      },
      {
        component: "TableCell",
        id: "r2c1",
        children: ["r2c1-t"],
      },
      { component: "RichText", id: "r2c1-t", text: "February" },
      {
        component: "TableCell",
        id: "r2c2",
        children: ["r2c2-t"],
      },
      { component: "RichText", id: "r2c2-t", text: "$12,500" },
      {
        component: "TableCell",
        id: "r2c3",
        children: ["r2c3-t"],
      },
      { component: "RichText", id: "r2c3-t", text: "145" },
    ]),
  },
};

// ---------------------------------------------------------------------------
// ColumnList
// ---------------------------------------------------------------------------

export const ColumnList: Story = {
  args: {
    messages: surface([
      {
        component: "ColumnList",
        id: "root",
        children: ["col1", "col2"],
      },
      {
        component: "Column",
        id: "col1",
        widthRatio: 2,
        children: ["col1-p"],
      },
      {
        component: "Paragraph",
        id: "col1-p",
        children: ["col1-t"],
      },
      {
        component: "RichText",
        id: "col1-t",
        text: "Wide column (flex 2)",
      },
      {
        component: "Column",
        id: "col2",
        widthRatio: 1,
        children: ["col2-p"],
      },
      {
        component: "Paragraph",
        id: "col2-p",
        children: ["col2-t"],
      },
      {
        component: "RichText",
        id: "col2-t",
        text: "Narrow column (flex 1)",
      },
    ]),
  },
};

// ---------------------------------------------------------------------------
// Unsupported
// ---------------------------------------------------------------------------

export const Unsupported: Story = {
  args: {
    messages: surface([
      {
        component: "Unsupported",
        id: "root",
        details: "CustomWidget",
      },
    ]),
  },
};
