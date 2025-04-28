import type { Meta, StoryObj } from "@storybook/vue3";
import ElmParallax from "./ElmParallax.vue";

import img1 from "../../assets/bg1.webp";
import img2 from "../../assets/bg2.webp";

const meta: Meta<typeof ElmParallax> = {
  title: "Components/Containments/ElmParallax",
  component: ElmParallax,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => ({
    components: { ElmParallax },
    template: `<div :style="{height: '1000vh'}"><ElmParallax imageUrl1="${img1}" imageUrl2="${img2}" /></div>`,
  }),
};
