import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmBookmark } from "./elm-bookmark";

const meta = {
  title: "Components/Navigation/elm-bookmark",
  component: ElmBookmark,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmBookmark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: "Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    image: "https://pnpm.io/img/ogimage.png",
    url: "https://pnpm.io/",
    favicon: "https://pnpm.io/img/favicon.png",
  },
};

export const WithoutFavicon: Story = {
  args: {
    ...Primary.args,
    favicon: undefined,
  },
};

export const InvalidImage: Story = {
  args: {
    ...Primary.args,
    image: "https://pnpm.io/",
  },
};

export const NoImage: Story = {
  args: {
    ...Primary.args,
    image: undefined,
  },
};
