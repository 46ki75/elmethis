import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmNotionCallout } from "./elm-notion-callout";
import { ElmParagraph } from "../typography/elm-paragraph";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt aliquam.";

const meta = {
  title: "Components/Notion/elm-notion-callout",
  component: ElmNotionCallout,
  tags: ["autodocs"],
  args: {
    icon: { kind: "emoji", emoji: "💡" },
  },
  argTypes: {
    color: {
      control: "radio",
      options: [
        "default",
        "gray",
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "purple",
        "magenta",
      ],
    },
    variant: {
      control: "radio",
      options: ["filled", "outlined"],
    },
  },
  render: (args) => ({
    components: { ElmNotionCallout, ElmParagraph },
    setup() {
      return { args, lorem };
    },
    template: `
      <ElmNotionCallout v-bind="args">
        <ElmParagraph>{{ lorem }}</ElmParagraph>
      </ElmNotionCallout>
    `,
  }),
} satisfies Meta<typeof ElmNotionCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Outlined: Story = {
  args: { variant: "outlined" },
};

export const Blue: Story = {
  args: { color: "blue" },
};

export const ImageIcon: Story = {
  args: {
    icon: {
      kind: "image",
      src: "https://rust-lang.org/logos/rust-logo-512x512.png",
      alt: "Rust logo",
    },
  },
};

export const NoIcon: Story = {
  args: { icon: undefined },
};
