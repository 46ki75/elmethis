import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmInlineText, type ElmInlineTextProps } from "./elm-inline-text";
import { opacify } from "polished";

const meta: Meta<ElmInlineTextProps> = {
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

  render: (args) => <ElmInlineText {...args}>Inline Text</ElmInlineText>,
};

export default meta;
type Story = StoryObj<ElmInlineTextProps>;

export const Primary: Story = {};

export const Colored: Story = {
  args: { color: "#b36472" },
};

export const Code: Story = {
  args: { code: true },
  render: (args) => <ElmInlineText {...args}>const x = 10;</ElmInlineText>,
};

export const Kbd: Story = {
  args: { kbd: true },
  render: (args) => <ElmInlineText {...args}>Ctrl</ElmInlineText>,
};

export const Background: Story = {
  args: { backgroundColor: opacify(-0.5, "#6987b8") },
};

export const Ruby: Story = {
  args: { ruby: "こくさいれんごう" },
  render: (args) => <ElmInlineText {...args}>国際連合</ElmInlineText>,
};

export const Link: Story = {
  args: {
    href: "https://google.com",
    favicon: "https://www.google.com/favicon.ico",
  },
  render: (args) => <ElmInlineText {...args}>Google Search</ElmInlineText>,
};

export const LinkWithOgp: Story = {
  args: {
    href: "https://code.visualstudio.com/",
    favicon: "https://code.visualstudio.com/assets/favicon.ico",
  },
  render: (args) => (
    <ElmInlineText {...args}>
      Visual Studio Code - Code Editing. Redefined
    </ElmInlineText>
  ),
};
