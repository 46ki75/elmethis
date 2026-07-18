import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

const meta = {
  title: "Components/Code/elm-shiki-highlighter",
  component: ElmShikiHighlighter,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmShikiHighlighter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    code: `type Greeting = { message: string };

const greeting: Greeting = { message: "Hello, Solid" };
console.log(greeting.message);`,
    language: "typescript",
  },
};

export const PlaintextFallback: Story = {
  args: {
    code: "An unknown language is rendered safely as plaintext.",
    language: "elmethis-unknown",
  },
};
