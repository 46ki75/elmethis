import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmDivider } from "./elm-divider";

const meta = {
  title: "Components/Typography/elm-divider",
  component: ElmDivider,
  tags: ["autodocs"],
  args: {},
  render: (args) => <ElmDivider {...args} />,
} satisfies Meta<typeof ElmDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
