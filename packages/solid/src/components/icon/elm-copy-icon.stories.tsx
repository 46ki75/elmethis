import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmCopyIcon } from "./elm-copy-icon";

const meta = {
  title: "Components/Icon/elm-copy-icon",
  component: ElmCopyIcon,
  tags: ["autodocs"],
  args: {
    content: "Hello, World!",
  },
  render: (args) => <ElmCopyIcon {...args} />,
} satisfies Meta<typeof ElmCopyIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
