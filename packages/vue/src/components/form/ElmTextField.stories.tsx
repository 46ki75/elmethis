import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmTextField from "./ElmTextField.vue";
import ElmButton from "./ElmButton.vue";
import { ref } from "vue";

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

export const Primary: Story = {};

export const Focus: Story = {
  render: (args) => ({
    components: { ElmTextField, ElmButton },
    setup() {
      const input = ref();
      const handleClick = () => {
        input.value?.focus();
      };
      return { args, input, handleClick };
    },
    template: `
    <ElmTextField v-bind="args" ref="input" />
    <ElmButton @click="handleClick">Focus</ElmButton>
    `,
  }),
};
