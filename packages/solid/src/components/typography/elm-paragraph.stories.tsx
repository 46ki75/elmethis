import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmParagraph } from "./elm-paragraph";

const meta = {
  title: "Components/Typography/elm-paragraph",
  component: ElmParagraph,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
  },
  render: (args) => (
    <ElmParagraph {...args}>
      This is a paragraph with an inline text component.
    </ElmParagraph>
  ),
} satisfies Meta<typeof ElmParagraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Color: Story = { args: { color: "#4b9ba9" } };
export const BackgroundColor: Story = {
  args: { backgroundColor: "#b1d6dc" },
};

export const Many: Story = {
  render: (args) => (
    <For each={Array.from({ length: 50 })}>
      {() => (
        <ElmParagraph {...args}>
          This is a paragraph with an inline text component.
        </ElmParagraph>
      )}
    </For>
  ),
};
