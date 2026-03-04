import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTextField } from "./elm-text-field";

const meta: Meta<typeof ElmTextField> = {
  title: "Components/Form/elm-text-field",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {
    label: "Label",
    placeholder: "Placeholder",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const WithIcon: Story = {
  args: {
    label: "With Icon",
    icon: "email",
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    isPassword: true,
    icon: "lock",
  },
};

export const MaxLength: Story = {
  args: {
    label: "Limited Input",
    maxLength: 10,
  },
};

export const Loading: Story = {
  args: {
    label: "Loading state",
    loading: true,
  },
};

