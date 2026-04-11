import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmModal } from "./ElmModal";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import { useState } from "react";

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
          <ElmModal {...args} value={isOpen} onChange={setIsOpen}>
            <ElmInlineText>Hello world!</ElmInlineText>
          </ElmModal>
        </div>
      );
    };
    return <PrimaryStory />;
  },
};
