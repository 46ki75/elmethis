import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmBreadcrumb } from "./elm-breadcrumb";

const meta = {
  title: "Components/Navigation/elm-breadcrumb",
  component: ElmBreadcrumb,
  tags: ["autodocs"],
  args: {
    links: [
      { text: "Home" },
      { text: "Library" },
      { text: "Data" },
      { text: "Data" },
    ],
  },
} satisfies Meta<typeof ElmBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

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
