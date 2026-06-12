import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmInlineIcon } from "./elm-inline-icon";

const meta = {
  title: "Components/Icon/elm-inline-icon",
  component: ElmInlineIcon,
  tags: ["autodocs"],
  args: {
    src: "https://rust-lang.org/logos/rust-logo-512x512.png",
  },
  render: (args) => <ElmInlineIcon {...args} />,
} satisfies Meta<typeof ElmInlineIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
