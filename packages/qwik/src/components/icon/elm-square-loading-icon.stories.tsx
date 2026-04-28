import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmSquareLoadingIcon,
  type ElmSquareLoadingIconProps,
} from "./elm-square-loading-icon";

const meta: Meta<ElmSquareLoadingIconProps> = {
  title: "Components/Icon/elm-square-loading-icon",
  component: ElmSquareLoadingIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<ElmSquareLoadingIconProps>;

export const Primary: Story = {
  args: {
    size: "3rem",
    dimensions: 4,
  },
};
