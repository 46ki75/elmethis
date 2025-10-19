import type { Meta, StoryObj } from "@storybook/vue3-vite";
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

export const LinkWithOgp: Story = {
  args: {
    text: "Visual Studio Code - Code Editing. Redefined",
    href: "https://code.visualstudio.com/",
    favicon: "https://code.visualstudio.com/assets/favicon.ico",
    ogp: {
      title: "Visual Studio Code - Code Editing. Redefined",
      description:
        "Visual Studio Code redefines AI-powered coding with GitHub Copilot for building and debugging modern web and cloud applications. Visual Studio Code is free and available on your favorite platform - Linux, macOS, and Windows.",
      image: "https://code.visualstudio.com/opengraphimg/opengraph-home.png",
    },
  },
};
