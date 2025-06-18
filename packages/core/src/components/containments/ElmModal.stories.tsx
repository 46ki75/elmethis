import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmModal from "./ElmModal.vue";
import { ref } from "vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

const meta: Meta<typeof ElmModal> = {
  title: "Components/Containments/ElmModal",
  component: ElmModal,
  tags: ["autodocs"],
  args: { closeOnClickOutside: true },
  argTypes: {
    closeOnClickOutside: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => ({
    components: { ElmModal, ElmInlineText },
    setup() {
      const isOpen = ref(false);
      return { isOpen, args };
    },
    template: `
      <div>
        <button @click="isOpen = !isOpen">Toggle Modal</button>
        <ElmModal v-model="isOpen" v-bind="args">
          <ElmInlineText text="Hello world!" />
        </ElmModal>
      </div>
    `,
  }),
};
