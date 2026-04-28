import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmKatex, type ElmKatexProps } from "./elm-katex";

const meta: Meta<ElmKatexProps> = {
  title: "Components/Code/elm-katex",
  component: ElmKatex,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmKatexProps>;

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
