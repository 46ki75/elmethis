import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

const meta = {
  title: "Components/Typography/elm-fragment-identifier",
  component: ElmFragmentIdentifier,
  tags: ["autodocs"],
  args: {
    id: "intro",
  },
  render: (args) => <ElmFragmentIdentifier {...args} />,
} satisfies Meta<typeof ElmFragmentIdentifier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
