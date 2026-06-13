import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { computed, ref } from "vue";

import { ElmValidation } from "./elm-validation";

const meta = {
  title: "Components/Form/elm-validation",
  component: ElmValidation,
  tags: ["autodocs"],
  args: {
    text: "Password must be at least 8 characters",
    isValid: false,
  },
  argTypes: {
    validColor: { control: "color" },
  },
} satisfies Meta<typeof ElmValidation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Valid: Story = {
  args: {
    text: "Password is valid",
    isValid: true,
  },
};

export const Interactive: Story = {
  render: () => ({
    components: { ElmValidation },
    setup() {
      const input = ref("");
      const isValidA = computed(() => input.value.length >= 8);
      const isValidB = computed(() => /.*\d.*/.test(input.value));
      const isValidC = computed(() => /.*[a-z].*/.test(input.value));
      const isValidD = computed(() => /.*[A-Z].*/.test(input.value));
      return { input, isValidA, isValidB, isValidC, isValidD };
    },
    template: `
      <div>
        <input type="password" v-model="input" placeholder="Enter password..." />
        <div style="margin-block: 1rem"></div>
        <ElmValidation text="Password must be at least 8 characters" :is-valid="isValidA" />
        <ElmValidation text="Password must contain a number" :is-valid="isValidB" />
        <ElmValidation text="Password must contain a lower letter" :is-valid="isValidC" />
        <ElmValidation text="Password must contain an uppercase letter" :is-valid="isValidD" />
      </div>
    `,
  }),
};
