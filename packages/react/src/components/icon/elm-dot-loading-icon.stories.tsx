import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

const meta = {
  title: "Components/Icon/elm-dot-loading-icon",
  component: ElmDotLoadingIcon,
  tags: ["autodocs"],
  args: { size: "4em" },
  render: (args) => <ElmDotLoadingIcon {...args} />,
} satisfies Meta<typeof ElmDotLoadingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
