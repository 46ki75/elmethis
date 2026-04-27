import type { Meta, StoryObj } from "storybook-framework-qwik";
import { elmBasicCatalogRendererMap as elmN2uiMap } from "./n2ui-components-renderer";
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
              component: "Paragraph",
              id: "root",
              children: ["greeting-1", "greeting-2"],
            },
            {
              component: "RichText",
              id: "greeting-1",
              text: "Hello, ",
            },
            {
              component: "RichText",
              id: "greeting-2",
              text: "world!",
              decoration: ["bold"],
            },
          ],
        },
      },
    ],
  },
};
