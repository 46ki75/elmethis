import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmInlineIcon } from "./elm-inline-icon";

const meta: Meta<typeof ElmInlineIcon> = {
  title: "Components/Icon/elm-inline-icon",
  component: ElmInlineIcon,
  tags: ["autodocs"],
  args: {
    src: "https://rust-lang.org/logos/rust-logo-512x512.png",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
