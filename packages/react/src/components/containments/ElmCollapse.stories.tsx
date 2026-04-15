import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCollapse, type ElmCollapseProps } from "./ElmCollapse";
import { useState } from "react";
import { ElmCodeBlock } from "@components/code/ElmCodeBlock";

import code from "./ElmCollapse.stories?raw";
import { ElmButton } from "@components/form/ElmButton";

const meta: Meta<typeof ElmCollapse> = {
  title: "Components/Containments/ElmCollapse",
  component: ElmCollapse,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const PrimaryRender = (args: ElmCollapseProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div style={{ width: "100%", marginBottom: "2rem" }}>
        <ElmButton block onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? "Close" : "Open"} Collapse
        </ElmButton>
      </div>
      <ElmCollapse {...args} isOpen={isOpen}>
        <ElmCodeBlock language="tsx" code={code} />
      </ElmCollapse>
    </div>
  );
};

export const Primary: Story = {
  render: PrimaryRender,
};
