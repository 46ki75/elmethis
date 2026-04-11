import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmColorSample } from "./ElmColorSample";

const meta: Meta<typeof ElmColorSample> = {
  title: "Components/Others/ElmColorSample",
  component: ElmColorSample,
  tags: ["autodocs"],
  args: {
    color: "#59b57c",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Blue: Story = {
  args: {
    color: "#6987b8",
  },
};
