import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmParallax } from "./elm-parallax";

import img1 from "../../assets/bg1.webp";
import img2 from "../../assets/bg2.webp";

const meta: Meta<typeof ElmParallax> = {
  title: "Components/Containments/elm-parallax",
  component: ElmParallax,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    images: [img1, img2],
  },
  render() {
    return (
      <div style={{ height: "1000vh" }}>
        <ElmParallax {...this.args} />
      </div>
    );
  },
};
