import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmValidation } from "./ElmValidation";
import { ElmTextField } from "./ElmTextField";
import { useState } from "react";

const meta: Meta<typeof ElmValidation> = {
  title: "Components/Form/ElmValidation",
  component: ElmValidation,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => {
    const PrimaryStory = () => {
      const [value, setValue] = useState("");

      return (
        <div>
          <ElmTextField
            label="Password"
            isPassword
            value={value}
            onChange={setValue}
          />
          <div style={{ marginBlock: "1rem" }}></div>
          <ElmValidation
            text="Password must be at least 8 characters"
            isValid={value.length >= 8}
          />
          <ElmValidation
            text="Password must contain a number"
            isValid={/.*\d+.*/.test(value)}
          />
          <ElmValidation
            text="Password must contain a lower letter"
            isValid={/.*[a-z]+.*/.test(value)}
          />
          <ElmValidation
            text="Password must contain an uppercase letter"
            isValid={/.*[A-Z]+.*/.test(value)}
          />
        </div>
      );
    };
    return <PrimaryStory />;
  },
};
