import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmCheckbox } from "./elm-checkbox";

const meta: Meta<typeof ElmCheckbox> = {
  title: "Components/Form/elm-checkbox",
  component: ElmCheckbox,
  tags: ["autodocs"],
  args: {
    label: "Checkbox Label",
    loading: false,
    disable: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args: any) => <ElmCheckbox {...args} />,
};
