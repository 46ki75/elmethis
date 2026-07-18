import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmBreadcrumb } from "./elm-breadcrumb";

const meta = {
  title: "Components/Navigation/elm-breadcrumb",
  component: ElmBreadcrumb,
  tags: ["autodocs"],
  args: {
    links: [
      { text: "Home" },
      { text: "Library" },
      { text: "Components" },
      { text: "Breadcrumb" },
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
      { text: "Components" },
      { text: "Navigation" },
      { text: "Examples" },
      { text: "Breadcrumb" },
    ],
  },
};
