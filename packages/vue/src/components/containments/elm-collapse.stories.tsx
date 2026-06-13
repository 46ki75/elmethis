import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import { ElmCollapse } from "./elm-collapse";

const meta = {
  title: "Components/Containments/elm-collapse",
  component: ElmCollapse,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmCollapse>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeRender = (direction: "row" | "column" | "both") => () => ({
  components: { ElmCollapse },
  setup() {
    const isOpen = ref(false);
    const toggle = () => (isOpen.value = !isOpen.value);
    return { isOpen, toggle, direction };
  },
  template: `
    <div>
      <button @click="toggle">{{ isOpen ? "Close" : "Open" }} Collapse</button>
      <ElmCollapse :is-open="isOpen" :direction="direction">
        <p>
          This is the collapsible content. Toggle the button above to expand or
          collapse it along the {{ direction }} direction.
        </p>
      </ElmCollapse>
    </div>
  `,
});

export const Row: Story = {
  render: makeRender("row"),
};

export const Column: Story = {
  render: makeRender("column"),
};

export const Both: Story = {
  render: makeRender("both"),
};
