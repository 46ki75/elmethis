import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmSimpleTooltip } from "./ElmSimpleTooltip";
import { ElmInlineText } from "@components/typography/ElmInlineText";

const meta: Meta<typeof ElmSimpleTooltip> = {
  title: "Components/Containments/ElmSimpleTooltip",
  component: ElmSimpleTooltip,
  tags: ["autodocs"],
  args: {
    text: "Hello, tooltip!",
  },
  render: (args) => (
    <ElmSimpleTooltip {...args}>
      <ElmInlineText>HOVER ME</ElmInlineText>
    </ElmSimpleTooltip>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Title: Story = {
  args: {
    title: "Tooltip Title",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu auctor eros. In sit amet suscipit odio. Vivamus mattis eleifend porta. Vivamus accumsan ante ut eleifend lobortis. Aliquam maximus purus a convallis posuere.",
  },
};
