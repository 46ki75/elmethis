import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmMermaid from "./ElmMermaid.vue";

const meta: Meta<typeof ElmMermaid> = {
  title: "Components/Code/ElmMermaid",
  component: ElmMermaid,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const TD = `
graph TD
    A[Root Directory] --> B[Folder 1]
    A --> C[Folder 2]
    B --> D[File 1.txt]
    B --> E[File 2.txt]
    C --> F[Subfolder]
    F --> G[File 3.txt]
`;

export const Primary: Story = {
  args: { code: TD },
};
