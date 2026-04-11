import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmConfirmModal } from "./ElmConfirmModal";
import { ElmButton } from "@components/form/ElmButton";
import { ElmList } from "@components/typography/ElmList";
import { useState } from "react";

const meta: Meta<typeof ElmConfirmModal> = {
  title: "Components/Containments/ElmConfirmModal",
  component: ElmConfirmModal,
  tags: ["autodocs"],
  args: {
    onConfirm: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Hi");
    },
  },
  argTypes: {
    closeOnClickOutside: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: "Delete Passkey",
  },
  render: (args) => {
    const PrimaryStory = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <ElmButton onClick={() => setIsOpen(true)}>OPEN</ElmButton>
          <ElmConfirmModal {...args} value={isOpen} onChange={setIsOpen}>
            <span>
              Are you sure you want to delete the following log group(s)?
            </span>
            <ElmList>
              <li>/aws/lambda/graphql-lambda-node</li>
              <li>/aws/lambda/java</li>
              <li>/aws/lambda/nuxt3</li>
              <li>/aws/lambda/next</li>
            </ElmList>
          </ElmConfirmModal>
        </div>
      );
    };
    return <PrimaryStory />;
  },
};
