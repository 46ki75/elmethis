import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmToggle, type ElmToggleProps } from "./ElmToggle";
import { ElmInlineText } from "@components/typography/ElmInlineText";

import md from "./ElmToggle.md?raw";
import { ElmMarkdown } from "@components/others/ElmMarkdown";
import { useState } from "react";

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

const MarkdoenStoryComponent = (args: ElmToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div>
        <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      </div>
      <ElmToggle
        {...args}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        summaryContent={
          <>
            <ElmInlineText>How to use </ElmInlineText>
            <ElmInlineText code>console.table()</ElmInlineText>
            <ElmInlineText>?</ElmInlineText>
          </>
        }
      >
        <ElmMarkdown markdown={md} />
      </ElmToggle>
    </div>
  );
};

export const Markdown: Story = {
  render: (args) => {
    return <MarkdoenStoryComponent {...args} />;
  },
};
