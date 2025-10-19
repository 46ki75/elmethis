import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmKatex from "./ElmKatex.vue";

const meta: Meta<typeof ElmKatex> = {
  title: "Components/Code/ElmKatex",
  component: ElmKatex,
  tags: ["autodocs"],
  args: {},
};

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
