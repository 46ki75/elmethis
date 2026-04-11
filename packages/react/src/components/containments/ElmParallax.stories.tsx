import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmParallax } from "./ElmParallax";

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
      <ElmParallax
        imageUrl1="https://via.placeholder.com/800x600"
        imageUrl2="https://via.placeholder.com/800x600"
      />
    </div>
  ),
};
