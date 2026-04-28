import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmCheckbox, type ElmCheckboxProps } from "./elm-checkbox";

const meta: Meta<ElmCheckboxProps> = {
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
type Story = StoryObj<ElmCheckboxProps>;

export const Primary: Story = {
  render() {
    return <ElmCheckbox {...(this.args as ElmCheckboxProps)} />;
  },
};
