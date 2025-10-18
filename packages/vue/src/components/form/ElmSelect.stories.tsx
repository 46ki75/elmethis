import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmSelect from "./ElmSelect.vue";
import { ref } from "vue";

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
  render: (args) => ({
    components: { ElmSelect },
    setup() {
      const options = ref<
        Array<{ id: string; label: string; description?: string }>
      >([
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
      ]);

      const selectedOption = ref<{
        id: string;
        label: string;
        description?: string;
      }>();
      return { options, selectedOption, args };
    },

    template: `
      <ElmSelect v-model:options="options" v-model:selected-option="selectedOption" v-bind="args" />
    `,
  }),
};
