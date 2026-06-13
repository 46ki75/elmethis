import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmA2ui } from "./elm-a2ui";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

const meta = {
  title: "Components/A2UI/elm-a2ui",
  component: ElmA2ui,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmA2ui>;

export default meta;
type Story = StoryObj<typeof meta>;

const surface = (surfaceId: string, components: object[]): object[] => [
  { version: "v0.9", createSurface: { surfaceId, catalogId: CATALOG_ID } },
  {
    version: "v0.9",
    updateComponents: { surfaceId, components },
  },
];

export const Primary: Story = {
  args: {
    messages: surface("s", [
      { component: "Column", id: "root", children: ["h", "p", "row"] },
      { component: "Text", id: "h", variant: "h2", text: "A2UI Basic Catalog" },
      {
        component: "Text",
        id: "p",
        text: "Each message maps a component type onto an elm renderer.",
      },
      { component: "Row", id: "row", children: ["b1", "b2"] },
      { component: "Button", id: "b1", variant: "primary", child: "b1l" },
      { component: "Text", id: "b1l", variant: "caption", text: "Primary" },
      { component: "Button", id: "b2", child: "b2l" },
      { component: "Text", id: "b2l", variant: "caption", text: "Secondary" },
    ]),
  },
};

export const Form: Story = {
  args: {
    messages: surface("f", [
      { component: "Column", id: "root", children: ["name", "agree", "vol"] },
      {
        component: "TextField",
        id: "name",
        label: "Name",
        value: { path: "/name" },
      },
      {
        component: "CheckBox",
        id: "agree",
        label: "I agree",
        value: { path: "/agree" },
      },
      {
        component: "Slider",
        id: "vol",
        min: 0,
        max: 100,
        value: { path: "/vol" },
      },
    ]),
  },
};

export const Card: Story = {
  args: {
    messages: surface("c", [
      { component: "Card", id: "root", child: "inner" },
      { component: "Column", id: "inner", children: ["title", "body"] },
      { component: "Text", id: "title", variant: "h3", text: "Card title" },
      { component: "Text", id: "body", text: "Cards wrap any single child." },
    ]),
  },
};
