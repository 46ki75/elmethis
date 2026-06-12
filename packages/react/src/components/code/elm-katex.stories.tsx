import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmKatex } from "./elm-katex";

const meta = {
  title: "Components/Code/elm-katex",
  component: ElmKatex,
  tags: ["autodocs"],
  args: {},
  render: (args) => <ElmKatex {...args} />,
} satisfies Meta<typeof ElmKatex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: { expression: "c = pmsqrt{a^2 + b^2}" },
};

export const Block: Story = {
  args: { expression: "c = pmsqrt{a^2 + b^2}", block: true },
};

export const Complex: Story = {
  args: {
    expression:
      "i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left( -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}, t) \\right) \\Psi(\\mathbf{r}, t)",
    block: true,
  },
};
