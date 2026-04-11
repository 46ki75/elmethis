import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmParallax } from "./ElmParallax";

import img1 from "../../assets/bg1.webp?url";
import img2 from "../../assets/bg2.webp?url";

const meta: Meta<typeof ElmParallax> = {
  title: "Components/Containments/ElmParallax",
  component: ElmParallax,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <div style={{ height: "1000vh" }}>
      <ElmParallax imageUrl1={img1} imageUrl2={img2} />
    </div>
  ),
};
