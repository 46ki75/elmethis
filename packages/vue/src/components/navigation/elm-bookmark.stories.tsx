import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmBookmark } from "./elm-bookmark";

const meta = {
  title: "Components/Navigation/elm-bookmark",
  component: ElmBookmark,
  tags: ["autodocs"],
  args: {
    favicon: "https://pnpm.io/img/favicon.png",
  },
} satisfies Meta<typeof ElmBookmark>;

export default meta;
type Story = StoryObj<typeof meta>;

const ogp =
  "OGP Checker - Check images for X(Twitter) and Facebook sharing | Web ToolBox";
const ogpDescription =
  "A tool to check OGP tags and OGP images for SNS shares for a given page in real time, accurately simulating X (formerly Twitter) and Facebook share images on both PC and mobile.";

export const Primary: Story = {
  args: {
    title: ogp,
    description: ogpDescription,
    image:
      "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image",
    url: "https://www.ikuma.cloud/blog/article/leather-shoes-painting",
    favicon: "https://pnpm.io/img/favicon.png",
  },
};

export const WithoutDate: Story = {
  args: {
    title: ogp,
    description: ogpDescription,
    image:
      "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image",
    url: "https://web-toolbox.dev/en/tools/ogp-checker",
  },
};

export const Square: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    image: "https://pnpm.io/img/ogimage.png",
  },
};

export const InvalidImage: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    image: "https://pnpm.io/",
  },
};

export const NoImage: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    favicon: "https://pnpm.io/img/favicon.png",
  },
};
