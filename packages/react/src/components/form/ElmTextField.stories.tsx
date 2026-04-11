import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTextField } from "./ElmTextField";
import { useState } from "react";

const meta: Meta<typeof ElmTextField> = {
  title: "Components/Form/ElmTextField",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {
    label: "Email",
    maxLength: 20,
    suffix: "@46ki75.com",
    placeholder: "Enter your email",
    icon: "email",
  },
  argTypes: {
    icon: {
      control: "radio",
      options: [
        undefined,
        "text",
        "pen",
        "email",
        "user",
        "lock",
        "key",
        "earth",
        "tag",
        "archive",
        "link",
        "search",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => {
    const PrimaryStory = () => {
      const [value, setValue] = useState("");
      return <ElmTextField {...args} value={value} onChange={setValue} />;
    };
    return <PrimaryStory />;
  },
};
