import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmRectangleWave } from "./elm-rectangle-wave";

const meta: Meta<typeof ElmRectangleWave> = {
  title: "Components/Fallback/elm-rectangle-wave",
  component: ElmRectangleWave,
  tags: ["autodocs"],
  args: {},
  render() {
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
