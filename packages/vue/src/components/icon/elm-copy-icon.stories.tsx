import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmCopyIcon } from "./elm-copy-icon";

const meta = {
  title: "Components/Icon/elm-copy-icon",
  component: ElmCopyIcon,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmCopyIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    content: "Hello, World!",
  },
};
