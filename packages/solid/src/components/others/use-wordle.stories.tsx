import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { useWordle, type UseWordleOptions } from "./use-wordle";

const Render = (props: UseWordleOptions) => {
  const { Wordle } = useWordle(props);
  return <Wordle />;
};

const meta = {
  title: "Components/Others/use-wordle",
  component: Render,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof Render>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const FixedWord: Story = {
  args: { initialWord: "which" },
};
