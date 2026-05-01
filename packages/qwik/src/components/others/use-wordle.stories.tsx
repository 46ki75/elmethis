import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$ } from "@builder.io/qwik";
import { useWordle, type UseWordleOptions } from "./use-wordle";

const meta: Meta<UseWordleOptions> = {
  title: "Components/Others/use-wordle",
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<UseWordleOptions>;

const Render = component$((args: UseWordleOptions) => {
  const { Wordle } = useWordle(args);
  return <Wordle />;
});

export const Primary: Story = {
  render: (args) => <Render {...args} />,
};

export const FixedWord: Story = {
  render: () => <Render initialWord="which" />,
};
