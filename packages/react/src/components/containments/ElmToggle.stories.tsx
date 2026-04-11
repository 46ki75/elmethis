import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmToggle } from "./ElmToggle";
import { ElmInlineText } from "@components/typography/ElmInlineText";

const meta: Meta<typeof ElmToggle> = {
  title: "Components/Containments/ElmToggle",
  component: ElmToggle,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => (
    <ElmToggle summary="Toggle Blocks" {...args}>
      <p>
        <ElmInlineText>Block Content</ElmInlineText>
      </p>
    </ElmToggle>
  ),
};

export const InlineSummary: Story = {
  render: (args) => (
    <ElmToggle
      {...args}
      summaryContent={
        <>
          <ElmInlineText>How to use </ElmInlineText>
          <ElmInlineText code>console.table()</ElmInlineText>
          <ElmInlineText>?</ElmInlineText>
        </>
      }
    >
      <p>
        <ElmInlineText>Block Content</ElmInlineText>
      </p>
    </ElmToggle>
  ),
};
