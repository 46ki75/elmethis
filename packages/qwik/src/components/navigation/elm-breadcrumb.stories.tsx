import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmBreadcrumb } from "./elm-breadcrumb";

const meta: Meta<typeof ElmBreadcrumb> = {
  title: "Components/Navigation/elm-breadcrumb",
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
