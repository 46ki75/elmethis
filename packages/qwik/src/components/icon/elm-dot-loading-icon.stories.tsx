import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmDotLoadingIcon,
  type ElmDotLoadingIconProps,
} from "./elm-dot-loading-icon";

const meta: Meta<ElmDotLoadingIconProps> = {
  title: "Components/Icon/elm-dot-loading-icon",
  component: ElmDotLoadingIcon,
  tags: ["autodocs"],
  args: { size: "4em" },
};

export default meta;
type Story = StoryObj<ElmDotLoadingIconProps>;

export const Primary: Story = {};
