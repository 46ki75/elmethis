import type { Meta, StoryObj } from "@storybook/vue3";
import ElmMdiIcon from "./ElmMdiIcon.vue";
import { mdiTag } from "@mdi/js";

const meta: Meta<typeof ElmMdiIcon> = {
  title: "Components/Icon/ElmMdiIcon",
  component: ElmMdiIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "1.25rem",
    d: mdiTag,
  },
};
