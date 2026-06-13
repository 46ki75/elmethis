import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import { ElmModal } from "./elm-modal";

const meta = {
  title: "Components/Containments/elm-modal",
  component: ElmModal,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => ({
    components: { ElmModal },
    setup() {
      const isOpen = ref(false);
      const toggle = () => (isOpen.value = !isOpen.value);
      return { args, isOpen, toggle };
    },
    template: `
      <button @click="toggle">Toggle Modal</button>
      <ElmModal v-bind="args" :is-open="isOpen" :on-close="toggle">
        <p>This is the content of the modal.</p>
      </ElmModal>
    `,
  }),
};

export const WithStyle: Story = {
  render: (args) => ({
    components: { ElmModal },
    setup() {
      const isOpen = ref(false);
      const toggle = () => (isOpen.value = !isOpen.value);
      return { args, isOpen, toggle };
    },
    template: `
      <button @click="toggle">Toggle Modal</button>
      <ElmModal v-bind="args" :is-open="isOpen" :on-close="toggle">
        <div style="background-color: white; border-radius: 0.25rem; padding: 1rem;">
          <p>This is the content of the modal.</p>
        </div>
      </ElmModal>
    `,
  }),
};

// Reproduces the bug where clicking a field inside a modal incorrectly closed
// it (the inner content wrapper stops click propagation to the backdrop).
export const WithField: Story = {
  render: (args) => ({
    components: { ElmModal },
    setup() {
      const isOpen = ref(false);
      const toggle = () => (isOpen.value = !isOpen.value);
      return { args, isOpen, toggle };
    },
    template: `
      <button @click="toggle">Open Modal</button>
      <ElmModal v-bind="args" :is-open="isOpen" :on-close="toggle">
        <div style="background-color: white; border-radius: 0.25rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <p>Clicking the text field below should NOT close this modal.</p>
          <label>Username <input type="text" placeholder="Enter username" /></label>
          <label>Password <input type="password" placeholder="Enter password" /></label>
        </div>
      </ElmModal>
    `,
  }),
};
