import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

const meta = {
  title: "Components/Icon/elm-square-loading-icon",
  component: ElmSquareLoadingIcon,
  tags: ["autodocs"],
  args: {},
  render: (args) => <ElmSquareLoadingIcon {...args} />,
} satisfies Meta<typeof ElmSquareLoadingIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "3rem",
    dimensions: 4,
  },
};
