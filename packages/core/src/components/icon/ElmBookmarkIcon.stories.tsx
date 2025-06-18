import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmBookmarkIcon from "./ElmBookmarkIcon.vue";

const meta: Meta<typeof ElmBookmarkIcon> = {
  title: "Components/Icon/ElmBookmarkIcon",
  component: ElmBookmarkIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    href: "https://github.com/",
    favicon: "https://github.githubassets.com/favicons/favicon.svg",
    name: "GitHub",
  },
};

export const Long: Story = {
  args: {
    href: "https://developer.mozilla.org/",
    favicon: "https://developer.mozilla.org/favicon-192x192.png",
    name: "Mozilla Developer Network",
  },
};

export const NoFavicon: Story = {
  args: {
    href: "www.npmjs.com",
    name: "npm",
  },
};
