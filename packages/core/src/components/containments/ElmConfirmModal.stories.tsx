import type { Meta, StoryObj } from "@storybook/vue3";
import ElmConfirmModal from "./ElmConfirmModal.vue";
import ElmButton from "../form/ElmButton.vue";
import { ref } from "vue";
import ElmList from "../typography/ElmList.vue";

const meta: Meta<typeof ElmConfirmModal> = {
  title: "Components/Containments/ElmConfirmModal",
  component: ElmConfirmModal,
  tags: ["autodocs"],
  args: {
    onConfirm: async () => {
      const { promise, resolve } = Promise.withResolvers();
      const id = window.setTimeout(resolve, 2000);
      await promise;
      window.clearTimeout(id);
      console.log("Hi");
    },
  },
  argTypes: {
    closeOnClickOutside: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: "Delete Passkey",
  },
  render: (args) => ({
    setup: () => {
      const isOpen = ref(false);
      const handleClick = () => (isOpen.value = true);
      return { args, isOpen, handleClick };
    },
    components: { ElmConfirmModal, ElmButton, ElmList },
    template: `
    <div>
        <ElmButton @click="handleClick">OPEN</ElmButton>
    </div>
        <ElmConfirmModal v-bind="args" v-model="isOpen">
            <span>
                Are you sure you want to delete the following log group(s)?
            </span>

            <ElmList>
                <li>/aws/lambda/graphql-lambda-node</li>
                <li>/aws/lambda/java</li>
                <li>/aws/lambda/nuxt3</li>
                <li>/aws/lambda/next</li>
            </ElmList>
        </ElmConfirmModal>
    `,
  }),
};
