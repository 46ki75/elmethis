import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmLanguageIcon from "./ElmLanguageIcon.vue";

const meta: Meta<typeof ElmLanguageIcon> = {
  title: "Components/Icon/ElmLanguageIcon",
  component: ElmLanguageIcon,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    language: {
      control: "radio",
      options: [
        "rust",
        "javascript",
        "typescript",
        "bash",
        "terraform",
        "css",
        "html",
        "npm",
        "java",
        "kotlin",
        "go",
        "python",
        "sql",
        "json",
        "lua",
        "csharp",
        "cpp",
        "c",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { language: "rust" },
};
