import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmA2uiRenderer,
  type ElmA2uiRendererProps,
} from "./elm-a2ui-renderer";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const meta: Meta<ElmA2uiRendererProps> = {
  title: "Components/A2UI/elm-a2ui-renderer",
  component: ElmA2uiRenderer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Pure UI renderer for A2UI v0.9 messages. " +
          "Pass a `messages` array of A2UI protocol messages; the component " +
          "manages the MessageProcessor internally.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<ElmA2uiRendererProps>;

export const Typography: Story = {
  parameters: {
    docs: {
      description: {
        story: "All Text component variants: h1–h5, body, and caption.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "typography", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "typography",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["h1", "h2", "h3", "h4", "h5", "body", "caption"],
              },
              { component: "Text", id: "h1", variant: "h1", text: "Heading 1" },
              { component: "Text", id: "h2", variant: "h2", text: "Heading 2" },
              { component: "Text", id: "h3", variant: "h3", text: "Heading 3" },
              { component: "Text", id: "h4", variant: "h4", text: "Heading 4" },
              { component: "Text", id: "h5", variant: "h5", text: "Heading 5" },
              {
                component: "Text",
                id: "body",
                variant: "body",
                text: "Body text — the default paragraph style.",
              },
              {
                component: "Text",
                id: "caption",
                variant: "caption",
                text: "Caption text — small, muted.",
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const Layout: Story = {
  parameters: {
    docs: {
      description: { story: "Row and Column containers with nested children." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "layout", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "layout",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["rowLabel", "row", "colLabel", "col"],
              },
              {
                component: "Text",
                id: "rowLabel",
                variant: "h4",
                text: "Row (spaceBetween)",
              },
              {
                component: "Row",
                id: "row",
                distribution: "spaceBetween",
                children: ["a", "b", "c"],
              },
              { component: "Text", id: "a", text: "Alpha" },
              { component: "Text", id: "b", text: "Beta" },
              { component: "Text", id: "c", text: "Gamma" },
              {
                component: "Text",
                id: "colLabel",
                variant: "h4",
                text: "Column (start)",
              },
              { component: "Column", id: "col", children: ["x", "y", "z"] },
              { component: "Text", id: "x", text: "First" },
              { component: "Text", id: "y", text: "Second" },
              { component: "Text", id: "z", text: "Third" },
            ],
          },
        },
      ]}
    />
  ),
};

export const Card: Story = {
  parameters: {
    docs: {
      description: { story: "Card container wrapping a Column of text." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "card", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "card",
            components: [
              { component: "Card", id: "root", child: "inner" },
              { component: "Column", id: "inner", children: ["title", "body"] },
              {
                component: "Text",
                id: "title",
                variant: "h3",
                text: "Card Title",
              },
              {
                component: "Text",
                id: "body",
                text: "This is the card body. Cards have a border, rounded corners, and a subtle shadow.",
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const Buttons: Story = {
  parameters: {
    docs: {
      description: { story: "Default and primary Button variants." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "buttons", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "buttons",
            components: [
              { component: "Row", id: "root", children: ["btn1", "btn2"] },
              { component: "Button", id: "btn1", child: "lbl1" },
              { component: "Text", id: "lbl1", text: "Default" },
              { component: "Button", id: "btn2", child: "lbl2", primary: true },
              { component: "Text", id: "lbl2", text: "Primary" },
            ],
          },
        },
      ]}
    />
  ),
};

export const FormFields: Story = {
  parameters: {
    docs: {
      description: {
        story: "TextField (text / password / number), CheckBox, and Slider.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "form", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "form",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["tf1", "tf2", "tf3", "check", "slider"],
              },
              {
                component: "TextField",
                id: "tf1",
                label: "Short text",
                text: "",
                textFieldType: "shortText",
              },
              {
                component: "TextField",
                id: "tf2",
                label: "Password",
                text: "",
                textFieldType: "obscured",
              },
              {
                component: "TextField",
                id: "tf3",
                label: "Number",
                text: "42",
                textFieldType: "number",
              },
              {
                component: "CheckBox",
                id: "check",
                label: "Enable feature",
                checked: true,
              },
              {
                component: "Slider",
                id: "slider",
                minValue: 0,
                maxValue: 100,
                value: 60,
              },
            ],
          },
        },
      ]}
    />
  ),
};

export const List: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "List component with a data-driven template list (`children.componentId` + `path`).",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "list", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "list",
            path: "/items",
            value: [
              { label: "Apple" },
              { label: "Banana" },
              { label: "Cherry" },
              { label: "Durian" },
            ],
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "list",
            components: [
              {
                component: "List",
                id: "root",
                children: { componentId: "item", path: "/items" },
              },
              { component: "Card", id: "item", child: "itemText" },
              { component: "Text", id: "itemText", text: { path: "label" } },
            ],
          },
        },
      ]}
    />
  ),
};

export const Divider: Story = {
  parameters: {
    docs: {
      description: { story: "Horizontal and vertical Divider variants." },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "divider", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "divider",
            components: [
              {
                component: "Column",
                id: "root",
                children: ["a", "div1", "b", "row"],
              },
              { component: "Text", id: "a", text: "Above" },
              { component: "Divider", id: "div1" },
              { component: "Text", id: "b", text: "Below" },
              {
                component: "Row",
                id: "row",
                children: ["left", "div2", "right"],
              },
              { component: "Text", id: "left", text: "Left" },
              { component: "Divider", id: "div2", axis: "vertical" },
              { component: "Text", id: "right", text: "Right" },
            ],
          },
        },
      ]}
    />
  ),
};

export const Tabs: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tabs component — currently renders the first tab's content.",
      },
    },
  },
  render: () => (
    <ElmA2uiRenderer
      messages={[
        {
          version: "v0.9",
          createSurface: { surfaceId: "tabs", catalogId: CATALOG_ID },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "tabs",
            components: [
              {
                component: "Tabs",
                id: "root",
                tabs: [
                  { title: "Overview", child: "tab1" },
                  { title: "Details", child: "tab2" },
                  { title: "History", child: "tab3" },
                ],
              },
              {
                component: "Text",
                id: "tab1",
                text: "Overview content goes here.",
              },
              { component: "Text", id: "tab2", text: "Detailed information." },
              { component: "Text", id: "tab3", text: "Historical data." },
            ],
          },
        },
      ]}
    />
  ),
};
