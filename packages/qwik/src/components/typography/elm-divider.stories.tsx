import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmDivider } from "./elm-divider";

const meta: Meta<typeof ElmDivider> = {
  title: "Components/Typography/elm-divider",
  component: ElmDivider,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
