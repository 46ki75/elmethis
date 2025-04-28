import type { Meta, StoryObj } from "@storybook/vue3";
import ElmSnackbarContainer from "./ElmSnackbarContainer.vue";
import { useSnackbarState } from "./useSnackbarState";
import { h } from "vue";

const meta: Meta<typeof ElmSnackbarContainer> = {
  title: "Components/Containments/ElmSnackbar",
  component: ElmSnackbarContainer,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SnackbarOnly: Story = {
  args: {
    snackbars: [],
  },
  render: (args) => ({
    components: { ElmSnackbarContainer },
    setup() {
      const { snackbars, push, remove } = useSnackbarState();

      const handlePushChildren = () => {
        push({
          children: h("p", "Hello World"),
        });
      };

      const handlePushLabel = () => {
        push({
          label: "Hello World",
        });
      };

      return { args, snackbars, handlePushChildren, handlePushLabel, remove };
    },
    template: `
    <button @click="handlePushChildren">Push Children</button>
    <button @click="handlePushLabel">Push Label</button>
    <ElmSnackbarContainer v-bind="args" :snackbars="snackbars" />`,
  }),
};
