import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmRectangleWave } from "./ElmRectangleWave";

const meta: Meta<typeof ElmRectangleWave> = {
  title: "Components/Fallback/ElmRectangleWave",
  component: ElmRectangleWave,
  tags: ["autodocs"],
  args: {},
  render: () => {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "2/1",
          margin: 0,
          position: "relative",
        }}
      >
        <ElmRectangleWave />
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
