import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

const meta: Meta<typeof ElmSquareLoadingIcon> = {
  title: "Components/Icon/elm-square-loading-icon",
  component: ElmSquareLoadingIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "3rem",
    dimensions: 4,
  },
};
