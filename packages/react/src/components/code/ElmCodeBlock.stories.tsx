import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCodeBlock } from "./ElmCodeBlock";

const jsCode = `const greet = (name) => {
  console.log(\`Hello, \${name}!\`);
};

greet("world");`;

const rustCode = `fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}`;

const meta: Meta<typeof ElmCodeBlock> = {
  title: "Components/Code/ElmCodeBlock",
  component: ElmCodeBlock,
  tags: ["autodocs"],
  args: {
    code: jsCode,
    language: "javascript",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Rust: Story = {
  args: {
    code: rustCode,
    language: "rust",
    caption: "fibonacci.rs",
  },
};

export const WithCaption: Story = {
  args: {
    code: jsCode,
    language: "javascript",
    caption: "greeting.js",
  },
};
