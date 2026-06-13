import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

const meta = {
  title: "Components/Icon/elm-dot-loading-icon",
  component: ElmDotLoadingIcon,
  tags: ["autodocs"],
  args: { size: "4em" },
} satisfies Meta<typeof ElmDotLoadingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
