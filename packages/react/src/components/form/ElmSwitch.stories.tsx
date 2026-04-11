import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmSwitch } from "./ElmSwitch";
import { useState } from "react";

const meta: Meta<typeof ElmSwitch> = {
  title: "Components/Form/ElmSwitch",
  component: ElmSwitch,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => {
    const PrimaryStory = () => {
      const [checked, setChecked] = useState(false);
      return <ElmSwitch {...args} checked={checked} onChange={setChecked} />;
    };
    return <PrimaryStory />;
  },
};
