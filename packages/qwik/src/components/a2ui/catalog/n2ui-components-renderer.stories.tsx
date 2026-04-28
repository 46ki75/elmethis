import type { Meta, StoryObj } from "storybook-framework-qwik";
import { elmN2UICatalogRendererMap as elmN2uiMap } from "./n2ui-components-renderer";
import { elmBasicCatalogRendererMap as elmBasicMap } from "../elm-a2ui-basic-catalog-renderer";
import { component$, noSerialize } from "@builder.io/qwik";
import { ElmA2uiRenderer, ElmA2uiRendererProps } from "../elm-a2ui-renderer";

const CATALOG_ID = "TODO";

const mergedCatalog = noSerialize({ ...elmBasicMap, ...elmN2uiMap });

const meta: Meta<ElmA2uiRendererProps> = {
  title: "Components/A2UI/Catalog/n2ui-components-renderer",
  component: ElmA2uiRenderer,
  tags: ["autodocs"],
  args: {
    catalogId: CATALOG_ID,
    catalog: mergedCatalog,
    messages: [{}],
  },
  render: (args) => {
    const Render = component$((args: ElmA2uiRendererProps) => {
      return <ElmA2uiRenderer {...args} />;
    });

    return <Render {...args} />;
  },
};

export default meta;
type Story = StoryObj<ElmA2uiRendererProps>;

export const Primary: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: { surfaceId: "rich_text", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "rich_text",
          components: [
            {
              component: "Column",
              id: "root",
              children: ["p1", "p2"],
            },
            {
              component: "Paragraph",
              id: "p1",
              children: ["greeting-p1-1", "greeting-p1-2"],
            },
            {
              component: "RichText",
              id: "greeting-p1-1",
              text: "Hello, ",
            },
            {
              component: "RichText",
              id: "greeting-p1-2",
              text: "world!",
              decoration: ["bold"],
            },
            {
              component: "Paragraph",
              id: "p2",
              children: ["greeting-p2-1", "greeting-p2-2", "greeting-p2-3"],
            },
            {
              component: "RichText",
              id: "greeting-p2-1",
              text: "Hello, ",
            },
            {
              component: "RichText",
              id: "greeting-p2-2",
              text: "world!",
              decoration: ["bold"],
            },
            {
              component: "LinkText",
              id: "greeting-p2-3",
              text: "A2UI",
              href: "https://a2ui.org/",
            },
          ],
        },
      },
    ],
  },
};

export const List: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: { surfaceId: "rich_text", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "rich_text",
          components: [
            {
              component: "List",
              id: "root",
              children: ["p1", "p2"],
            },
            {
              component: "ListItem",
              id: "p1",
              children: ["greeting-p1-1", "greeting-p1-2"],
            },
            {
              component: "ListItem",
              id: "p2",
              children: ["greeting-p2-1", "greeting-p2-2", "greeting-p2-3"],
            },
            {
              component: "RichText",
              id: "greeting-p1-1",
              text: "Hello, ",
            },
            {
              component: "RichText",
              id: "greeting-p1-2",
              text: "world!",
              decoration: ["bold"],
            },
            {
              component: "RichText",
              id: "greeting-p2-1",
              text: "Hello, ",
            },
            {
              component: "RichText",
              id: "greeting-p2-2",
              text: "world!",
              decoration: ["bold"],
            },
            {
              component: "LinkText",
              id: "greeting-p2-3",
              text: "A2UI",
              href: "https://a2ui.org/",
            },
          ],
        },
      },
    ],
  },
};

export const CodeBlock: Story = {
  args: {
    messages: [
      {
        version: "v0.9",
        createSurface: { surfaceId: "code_block", catalogId: CATALOG_ID },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "code_block",
          components: [
            {
              component: "CodeBlock",
              id: "code1",
              code: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}`,
              language: "javascript",
              caption: "Example JavaScript function",
            },
          ],
        },
      },
    ],
  },
};
