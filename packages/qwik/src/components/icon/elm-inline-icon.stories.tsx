import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmInlineIcon, type ElmInlineIconProps } from "./elm-inline-icon";

const meta: Meta<ElmInlineIconProps> = {
  title: "Components/Icon/elm-inline-icon",
  component: ElmInlineIcon,
  tags: ["autodocs"],
  args: {
    src: "https://rust-lang.org/logos/rust-logo-512x512.png",
  },
};

export default meta;
type Story = StoryObj<ElmInlineIconProps>;

export const Primary: Story = {};
