import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ElmInlineText } from "./elm-inline-text";

const slotted =
  (content: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (args: any) => ({
    components: { ElmInlineText },
    setup() {
      return { args };
    },
    template: `<ElmInlineText v-bind="args">${content}</ElmInlineText>`,
  });

const meta = {
  title: "Components/Typography/elm-inline-text",
  component: ElmInlineText,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
    bold: { control: "boolean" },
    italic: { control: "boolean" },
    underline: { control: "boolean" },
    strikethrough: { control: "boolean" },
    code: { control: "boolean" },
    kbd: { control: "boolean" },
  },
  args: {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    kbd: false,
  },
  render: slotted("Inline Text"),
} satisfies Meta<typeof ElmInlineText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Colored: Story = {
  args: { color: "#b36472" },
};

export const Code: Story = {
  args: { code: true },
  render: slotted("const x = 10;"),
};

export const Kbd: Story = {
  args: { kbd: true },
  render: slotted("Ctrl"),
};

export const Background: Story = {
  args: { backgroundColor: "rgba(105, 135, 184, 0.5)" },
};

export const Ruby: Story = {
  args: { ruby: "こくさいれんごう" },
  render: slotted("国際連合"),
};

export const Link: Story = {
  args: {
    href: "https://google.com",
    favicon: "https://www.google.com/favicon.ico",
  },
  render: slotted("Google Search"),
};

export const LinkWithOgp: Story = {
  args: {
    href: "https://code.visualstudio.com/",
    favicon: "https://code.visualstudio.com/assets/favicon.ico",
  },
  render: slotted("Visual Studio Code - Code Editing. Redefined"),
};
