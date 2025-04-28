import type { Meta, StoryObj } from "@storybook/vue3";
import ElmInlineText from "./ElmInlineText.vue";
import { opacify } from "polished";

const meta: Meta<typeof ElmInlineText> = {
  title: "Components/Typography/ElmInlineText",
  component: ElmInlineText,
  tags: ["autodocs"],
  argTypes: { color: { control: "color" } },
  args: { text: "Inline Text" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Colored: Story = {
  args: { color: "#b36472" },
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
