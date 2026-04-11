import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmKatex } from "./ElmKatex";

const meta: Meta<typeof ElmKatex> = {
  title: "Components/Code/ElmKatex",
  component: ElmKatex,
  tags: ["autodocs"],
  args: {
    expression: "c = \\pm\\sqrt{a^2 + b^2}",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: {
    block: false,
  },
};

export const Block: Story = {
  args: {
    block: true,
  },
};

export const Schrodinger: Story = {
  args: {
    expression:
      "i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)",
    block: true,
  },
};
