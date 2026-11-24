import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmProgress } from "./elm-progress";

const meta = {
  title: "Components/Data/elm-progress",
  component: ElmProgress,
  tags: ["autodocs"],
  argTypes: {
    color: { control: "color" },
  },
} satisfies Meta<typeof ElmProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    "aria-label": "Upload progress",
    color: "#a68c70",
    max: 100,
    value: 50,
    weight: "8px",
  },
};
