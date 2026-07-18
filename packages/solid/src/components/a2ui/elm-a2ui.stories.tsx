import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { NOTION_BLOCK_CATALOG_ID } from "@elmethis/core";

import { BASIC_CATALOG_ID, ElmA2ui } from "./elm-a2ui";

const meta = {
  title: "Components/A2UI/elm-a2ui",
  component: ElmA2ui,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmA2ui>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicCatalog: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: { surfaceId: "basic", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "basic",
          components: [
            { component: "Column", id: "root", children: ["title", "card"] },
            {
              component: "Text",
              id: "title",
              variant: "h2",
              text: "Basic catalog",
            },
            { component: "Card", id: "card", child: "body" },
            {
              component: "Text",
              id: "body",
              text: "Solid-native A2UI rendering",
            },
          ],
        },
      },
    ],
  },
};

export const DataBinding: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: { surfaceId: "binding", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "binding", path: "/name", value: "Ada" },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "binding",
          components: [
            { component: "Column", id: "root", children: ["field", "echo"] },
            {
              component: "TextField",
              id: "field",
              label: "Name",
              value: { path: "/name" },
            },
            {
              component: "Text",
              id: "echo",
              text: { call: "formatString", args: { value: "Hello ${/name}" } },
            },
          ],
        },
      },
    ],
  },
};

export const NotionBlocks: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "notion",
          catalogId: NOTION_BLOCK_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "notion",
          components: [
            {
              component: "Column",
              id: "root",
              children: ["heading", "paragraph", "quote", "callout", "code"],
            },
            {
              component: "Heading",
              id: "heading",
              level: 2,
              children: ["heading-text"],
            },
            {
              component: "RichText",
              id: "heading-text",
              text: "Notion block catalog",
            },
            {
              component: "Paragraph",
              id: "paragraph",
              children: ["normal", "strong"],
            },
            { component: "RichText", id: "normal", text: "Inline text with " },
            {
              component: "RichText",
              id: "strong",
              text: "decoration",
              decoration: ["bold", "underline"],
            },
            { component: "BlockQuote", id: "quote", children: ["quote-text"] },
            {
              component: "RichText",
              id: "quote-text",
              text: "Agent-authored, native UI.",
            },
            {
              component: "NotionCallout",
              id: "callout",
              icon: { kind: "emoji", emoji: "i" },
              color: "blue",
              children: ["callout-text"],
            },
            {
              component: "RichText",
              id: "callout-text",
              text: "The Notion catalog is the Solid default.",
            },
            {
              component: "CodeBlock",
              id: "code",
              language: "typescript",
              code: "const catalog = notionBlockCatalog;",
            },
          ],
        },
      },
    ],
  },
};

export const TablesAndTabs: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "structured",
          catalogId: NOTION_BLOCK_CATALOG_ID,
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "structured",
          components: [
            { component: "Column", id: "root", children: ["tabs", "table"] },
            {
              component: "ContentTabs",
              id: "tabs",
              children: ["tab-a", "tab-b"],
            },
            {
              component: "ContentTab",
              id: "tab-a",
              label: ["label-a"],
              content: ["panel-a"],
            },
            { component: "RichText", id: "label-a", text: "Overview" },
            {
              component: "Paragraph",
              id: "panel-a",
              children: ["panel-a-text"],
            },
            { component: "RichText", id: "panel-a-text", text: "First panel" },
            {
              component: "ContentTab",
              id: "tab-b",
              label: ["label-b"],
              content: ["panel-b"],
            },
            { component: "RichText", id: "label-b", text: "Details" },
            {
              component: "Paragraph",
              id: "panel-b",
              children: ["panel-b-text"],
            },
            { component: "RichText", id: "panel-b-text", text: "Second panel" },
            {
              component: "Table",
              id: "table",
              caption: "Comparison",
              body: ["row"],
              hasColumnHeader: true,
            },
            { component: "TableRow", id: "row", children: ["key", "value"] },
            { component: "TableCell", id: "key", children: ["key-text"] },
            { component: "RichText", id: "key-text", text: "Renderer" },
            { component: "TableCell", id: "value", children: ["value-text"] },
            { component: "RichText", id: "value-text", text: "Solid" },
          ],
        },
      },
    ],
  },
};
