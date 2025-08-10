import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmValidation from "./ElmValidation.vue";
import ElmTextField from "./ElmTextField.vue";
import { ref } from "vue";

const meta: Meta<typeof ElmValidation> = {
  title: "Components/Form/ElmValidation",
  component: ElmValidation,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (_) => ({
    components: { ElmValidation, ElmTextField },

    setup() {
      const input = ref<string>();
      const validateFunctionA = (input: string) => {
        return input.length >= 8;
      };
      const validateFunctionB = (input: string) => {
        return /.*\d+.*/.test(input);
      };
      const validateFunctionC = (input: string) => {
        return /.*[a-z]+.*/.test(input);
      };
      const validateFunctionD = (input: string) => {
        return /.*[A-Z]+.*/.test(input);
      };

      const textA = "Password must be at least 8 characters";
      const textB = "Password must contain a number";
      const textC = "Password must contain an lower letter";
      const textD = "Password must contain an uppercase letter";

      return {
        input,
        validateFunctionA,
        textA,
        validateFunctionB,
        textB,
        validateFunctionC,
        textC,
        validateFunctionD,
        textD,
      };
    },
    template: `
      <ElmTextField v-model="input" label="Password" isPassword />
      <div style="margin-block: 1rem;"></div>
      <ElmValidation :text="textA" :validateFunction="validateFunctionA" :input="input" />
      <ElmValidation :text="textB" :validateFunction="validateFunctionB" :input="input" />
      <ElmValidation :text="textC" :validateFunction="validateFunctionC" :input="input" />
      <ElmValidation :text="textD" :validateFunction="validateFunctionD" :input="input" />
    `,
  }),
};
