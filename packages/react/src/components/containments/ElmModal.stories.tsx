import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmModal } from "./ElmModal";

import { useState } from "react";
import { ElmCodeBlock } from "@components/code/ElmCodeBlock";

import code from "./ElmModal.stories.tsx?raw";

const meta: Meta<typeof ElmModal> = {
  title: "Components/Containments/ElmModal",
  component: ElmModal,
  tags: ["autodocs"],
  args: { closeOnClickOutside: true },
  argTypes: {
    closeOnClickOutside: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => {
    const PrimaryStory = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)}>Toggle Modal</button>
          <ElmModal {...args} isOpen={isOpen} setIsOpen={setIsOpen}>
            <ElmCodeBlock language="tsx" code={code} />
          </ElmModal>
        </div>
      );
    };
    return <PrimaryStory />;
  },
};
