import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmInlineText } from "./ElmInlineText";
import { opacify } from "polished";

const meta: Meta<typeof ElmInlineText> = {
  title: "Components/Components/ElmInlineText",
  component: ElmInlineText,
  tags: ["autodocs"],
  args: {
    children: "This is an inline text.",
  },
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
    bold: { control: "boolean" },
    italic: { control: "boolean" },
    underline: { control: "boolean" },
    strikethrough: { control: "boolean" },
    code: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Colored: Story = {
  args: { color: "#b36472" },
};

export const Kbd: Story = {
  args: { children: "Ctrl", kbd: true },
};

export const Background: Story = {
  args: { backgroundColor: opacify(-0.5, "#6987b8") },
};

export const Ruby: Story = {
  args: { children: "国際連合", ruby: "こくさいれんごう" },
};
