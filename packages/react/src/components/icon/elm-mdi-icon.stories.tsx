import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmMdiIcon } from "./elm-mdi-icon";
import { mdiTag } from "@mdi/js";

const meta = {
  title: "Components/Icon/elm-mdi-icon",
  component: ElmMdiIcon,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    color: { control: "color" },
    label: {
      control: "text",
      description: "Accessible label rendered as the SVG title.",
    },
  },
  render: (args) => <ElmMdiIcon {...args} />,
} satisfies Meta<typeof ElmMdiIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "1.25rem",
    path: mdiTag,
    label: "Tag",
  },
};
