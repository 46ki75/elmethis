import type { Meta, StoryObj } from "@storybook/react-vite";
import ElmInlineText from "./ElmInlineText";
import { opacify } from "polished";

const meta: Meta<typeof ElmInlineText> = {
  title: "Components/Typography/ElmInlineText",
  component: ElmInlineText,
  tags: ["autodocs"],
  args: {
    text: "Hello, world!",
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
  },
  argTypes: {
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    text: "Hello, world!",
  },
};

export const Colored: Story = {
  args: { color: "#b36472" },
};

export const Kbd: Story = {
  args: { text: "Ctrl", kbd: true },
};

export const Background: Story = {
  args: { backgroundColor: opacify(-0.5, "#6987b8") },
};

export const Ruby: Story = {
  args: { text: "国際連合", ruby: "こくさいれんごう" },
};

export const Link: Story = {
  args: {
    text: "Google Search",
    href: "https://google.com",
    favicon: "https://www.google.com/favicon.ico",
  },
};
