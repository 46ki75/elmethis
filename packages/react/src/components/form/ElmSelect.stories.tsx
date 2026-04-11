import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmSelect } from "./ElmSelect";
import type { ElmSelectOption } from "./ElmSelect";
import { useState } from "react";

const options: ElmSelectOption[] = [
  {
    id: "1",
    label: "banana",
    description: "A yellow fruit that's high in potassium.",
  },
  {
    id: "2",
    label: "apple",
    description: "A sweet red or green fruit often eaten raw.",
  },
  {
    id: "3",
    label: "orange",
    description: "A citrus fruit known for its vitamin C content.",
  },
  {
    id: "4",
    label: "grape",
    description: "A small, juicy fruit often used to make wine.",
  },
];

const meta: Meta<typeof ElmSelect> = {
  title: "Components/Form/ElmSelect",
  component: ElmSelect,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Select",
  },
  render: (args) => {
    const [selectedOption, setSelectedOption] =
      useState<ElmSelectOption | null>(null);
    return (
      <ElmSelect
        {...args}
        options={options}
        selectedOption={selectedOption}
        onSelect={setSelectedOption}
      />
    );
  },
};
