import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmBookmark } from "./elm-bookmark";

const meta: Meta<typeof ElmBookmark> = {
  title: "Components/Navigation/elm-bookmark",
  component: ElmBookmark,
  tags: ["autodocs"],
  args: {
    favicon: "https://pnpm.io/img/favicon.png",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title:
      "OGP Checker - Check images for X(Twitter) and Facebook sharing | Web ToolBox",
    description:
      "A tool to check OGP tags and OGP images for SNS shares for a given page in real time, accurately simulating X (formerly Twitter) and Facebook share images on both PC and mobile.",
    image:
      "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image",
    url: "https://www.ikuma.cloud/blog/article/leather-shoes-painting",
    favicon: "https://pnpm.io/img/favicon.png",
  },
};

export const WithoutDate: Story = {
  args: {
    title:
      "OGP Checker - Check images for X(Twitter) and Facebook sharing | Web ToolBox",
    description:
      "A tool to check OGP tags and OGP images for SNS shares for a given page in real time, accurately simulating X (formerly Twitter) and Facebook share images on both PC and mobile.",
    image:
      "https://web-toolbox.dev/__og-image__/static/en/tools/ogp-checker/og.png",
    url: "https://web-toolbox.dev/en/tools/ogp-checker",
  },
};

export const Card: Story = {
  args: {
    title:
      "OGP Checker - Check images for X(Twitter) and Facebook sharing | Web ToolBox",
    description:
      "A tool to check OGP tags and OGP images for SNS shares for a given page in real time, accurately simulating X (formerly Twitter) and Facebook share images on both PC and mobile.",
    image:
      "https://www.ikuma.cloud/api/v2/blog/leather-shoes-painting/og-image",
    url: "https://www.ikuma.cloud/blog/article/leather-shoes-painting",
  },
};

export const Square: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "	Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    image: "https://pnpm.io/img/ogimage.png",
  },
};

export const SquareCard: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "	Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    image: "https://pnpm.io/img/ogimage.png",
  },
};

export const InvalidImage: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "	Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    image: "https://pnpm.io/",
  },
};

export const NoImage: Story = {
  args: {
    url: "https://pnpm.io/",
    title: "	Fast, disk space efficient package manager | pnpm",
    description: "Fast, disk space efficient package manager",
    favicon: "https://pnpm.io/img/favicon.png",
  },
};
