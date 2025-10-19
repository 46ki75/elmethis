import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmMdiIcon } from "./ElmMdiIcon";
import { mdiTag } from "@mdi/js";

const meta: Meta<typeof ElmMdiIcon> = {
  title: "Components/Icon/ElmMdiIcon",
  component: ElmMdiIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "1.25rem",
    d: mdiTag,
  },
};
