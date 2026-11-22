import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmTemplate } from "./elm-template";

const meta = {
  title: "Components/Others/elm-template",
  component: ElmTemplate,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Template content" },
};
