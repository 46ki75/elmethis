import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmInlineText } from "./elm-inline-text";
import { opacify } from "polished";

const meta: Meta<typeof ElmInlineText> = {
  title: "Components/Typography/elm-inline-text",
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

export const Code: Story = {
  args: { code: true, text: "const x = 10;" },
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
  },
};
