import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTooltip } from "./elm-tooltip";

const meta = {
  title: "Components/Containments/elm-tooltip",
  component: ElmTooltip,
  tags: ["autodocs"],
  args: {},
  render: (args) => (
    <ElmTooltip
      {...args}
      original={<span>HOVER ME</span>}
      tooltip={<span>TOOLTIP</span>}
    />
  ),
} satisfies Meta<typeof ElmTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
