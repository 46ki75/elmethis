import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmBreadcrumb } from "./ElmBreadcrumb";

const meta: Meta<typeof ElmBreadcrumb> = {
  title: "Components/Navigation/ElmBreadcrumb",
  component: ElmBreadcrumb,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    links: [
      { text: "Home" },
      { text: "Library" },
      { text: "Data" },
      { text: "Data" },
    ],
  },
};

export const Long: Story = {
  args: {
    links: [
      { text: "Home" },
      { text: "Library" },
      { text: "Data" },
      { text: "Data" },
      { text: "Data" },
      { text: "Data" },
      { text: "Data" },
    ],
  },
};
