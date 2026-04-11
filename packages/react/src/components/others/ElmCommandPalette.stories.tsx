import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCommandPalette } from "./ElmCommandPalette";
import type { Command } from "./ElmCommandPalette";

const commands: Command[] = [
  {
    id: "github",
    label: "GitHub",
    description: "https://github.com",
    icon: "https://github.githubassets.com/favicons/favicon.svg",
    keywords: ["git", "code"],
    tag: { name: "URL", color: "blue" },
    onInvoke: () => window.open("https://github.com", "_blank"),
  },
  {
    id: "vueuse",
    label: "VueUse",
    description: "https://vueuse.org",
    icon: "https://vueuse.org/favicon.svg",
    keywords: ["vue", "composables"],
    tag: { name: "URL", color: "emerald" },
    onInvoke: () => window.open("https://vueuse.org", "_blank"),
  },
  {
    id: "mdn",
    label: "MDN Web Docs",
    description: "https://developer.mozilla.org",
    icon: "https://developer.mozilla.org/favicon.svg",
    keywords: ["web", "docs", "javascript"],
    tag: { name: "URL", color: "blue" },
    onInvoke: () => window.open("https://developer.mozilla.org", "_blank"),
  },
  {
    id: "stackoverflow",
    label: "Stack Overflow",
    description: "https://stackoverflow.com",
    keywords: ["qa", "programming"],
    tag: { name: "URL", color: "amber" },
    onInvoke: () => window.open("https://stackoverflow.com", "_blank"),
  },
];

const meta: Meta<typeof ElmCommandPalette> = {
  title: "Components/Others/ElmCommandPalette",
  component: ElmCommandPalette,
  tags: ["autodocs"],
  args: {
    commands,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
