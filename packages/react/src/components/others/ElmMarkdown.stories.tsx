import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmMarkdown } from "./ElmMarkdown";

const markdown = `# Hello World

This is a **paragraph** with *italic* and \`code\` text.

## Lists

- Item 1
- Item 2
- Item 3

1. First
2. Second
3. Third

## Blockquote

> This is a blockquote.

## Code Block

\`\`\`javascript
const greet = (name) => console.log(\`Hello, \${name}!\`);
\`\`\`
`;

const meta: Meta<typeof ElmMarkdown> = {
  title: "Components/Others/ElmMarkdown",
  component: ElmMarkdown,
  tags: ["autodocs"],
  args: {
    markdown,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
