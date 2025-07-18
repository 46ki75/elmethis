import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmBookmark from "./ElmBookmark.vue";

const meta: Meta<typeof ElmBookmark> = {
  title: "Components/Navigation/ElmBookmark",
  component: ElmBookmark,
  tags: ["autodocs"],
  args: {},
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
      "https://web-toolbox.dev/__og-image__/static/en/tools/ogp-checker/og.png",
    url: "https://web-toolbox.dev/en/tools/ogp-checker",
    createdAt: "2021-08-01",
    updatedAt: "2021-08-01",
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
      "https://web-toolbox.dev/__og-image__/static/en/tools/ogp-checker/og.png",
    url: "https://web-toolbox.dev/en/tools/ogp-checker",
    createdAt: "2021-08-01",
    updatedAt: "2021-08-01",
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
