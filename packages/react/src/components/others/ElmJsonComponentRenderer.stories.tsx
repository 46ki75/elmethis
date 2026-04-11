import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmJsonComponentRenderer } from "./ElmJsonComponentRenderer";

const meta: Meta<typeof ElmJsonComponentRenderer> = {
  title: "Components/Others/ElmJsonComponentRenderer",
  component: ElmJsonComponentRenderer,
  tags: ["autodocs"],
  args: {
    jsonComponents: [
      { type: "Heading", props: { level: 1 }, slots: { default: [{ type: "Text", props: { text: "Hello World" } }] } },
      { type: "Paragraph", slots: { default: [{ type: "Text", props: { text: "This is a paragraph." } }] } },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
