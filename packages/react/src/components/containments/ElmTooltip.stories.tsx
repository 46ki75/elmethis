import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTooltip } from "./ElmTooltip";
import { ElmInlineText } from "@components/typography/ElmInlineText";

const meta: Meta<typeof ElmTooltip> = {
  title: "Components/Containments/ElmTooltip",
  component: ElmTooltip,
  tags: ["autodocs"],
  args: {},
  render: (args) => (
    <ElmTooltip
      {...args}
      original={<ElmInlineText>HOVER ME</ElmInlineText>}
      tooltip={<ElmInlineText>TOOLTIP</ElmInlineText>}
    />
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
