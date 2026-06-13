import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmParallax } from "./elm-parallax";

import img1 from "../../assets/bg1.webp";
import img2 from "../../assets/bg2.webp";

const meta = {
  title: "Components/Containments/elm-parallax",
  component: ElmParallax,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmParallax>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    images: [img1, img2],
  },
  render: (args) => ({
    components: { ElmParallax },
    setup() {
      return { args };
    },
    template: `
      <div style="height: 1000vh">
        <ElmParallax v-bind="args" />
      </div>
    `,
  }),
};
