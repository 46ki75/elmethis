import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmTextField from "./ElmTextField.vue";

const meta: Meta<typeof ElmTextField> = {
  title: "Components/Form/ElmTextField",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {},
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
  args: {
    label: "Email",
    maxLength: 20,
    suffix: "@46ki75.com",
    placeholder: "Enter your email",
  },
};
