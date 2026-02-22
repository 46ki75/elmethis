import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmValidation from "./ElmValidation.vue";
import ElmTextField from "./ElmTextField.vue";
import { computed, ref } from "vue";

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

      return {
        input,

        textA: "Password must be at least 8 characters",
        isValidA: computed(
          () => input.value != null && input.value.length >= 8,
        ),

        textB: "Password must contain a number",
        isValidB: computed(() => /.*\d+.*/.test(input.value || "")),

        textC: "Password must contain a lower letter",
        isValidC: computed(() => /.*[a-z]+.*/.test(input.value || "")),

        textD: "Password must contain an uppercase letter",
        isValidD: computed(() => /.*[A-Z]+.*/.test(input.value || "")),
      };
    },
    template: `
      <ElmTextField v-model="input" label="Password" isPassword />
      <div style="margin-block: 1rem;"></div>
      <ElmValidation :text="textA" :is-valid="isValidA" />
      <ElmValidation :text="textB" :is-valid="isValidB" />
      <ElmValidation :text="textC" :is-valid="isValidC" />
      <ElmValidation :text="textD" :is-valid="isValidD" />
    `,
  }),
};
