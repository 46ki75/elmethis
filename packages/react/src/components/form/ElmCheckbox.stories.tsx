import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCheckbox } from "./ElmCheckbox";
import { useState } from "react";

const meta: Meta<typeof ElmCheckbox> = {
  title: "Components/Form/ElmCheckbox",
  component: ElmCheckbox,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: "Checkbox" },
  render: (args) => {
    const PrimaryStory = () => {
      const [checked, setChecked] = useState(false);
      return (
        <ElmCheckbox {...args} checked={checked} onChange={setChecked} />
      );
    };
    return <PrimaryStory />;
  },
};
