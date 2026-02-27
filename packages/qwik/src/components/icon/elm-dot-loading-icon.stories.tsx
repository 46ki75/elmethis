import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

const meta: Meta<typeof ElmDotLoadingIcon> = {
  title: "Components/Icon/elm-dot-loading-icon",
  component: ElmDotLoadingIcon,
  tags: ["autodocs"],
  argTypes: { color: { control: "color" } },
  args: { size: "4em" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
