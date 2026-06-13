import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { defineComponent, h } from "vue";

import { useWordle, type UseWordleOptions } from "./use-wordle";

const Render = defineComponent({
  name: "UseWordleStory",
  props: {
    initialWord: { type: String, default: undefined },
  },
  setup(props) {
    const options: UseWordleOptions = { initialWord: props.initialWord };
    const { Wordle } = useWordle(options);
    return () => h(Wordle);
  },
});

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
  args: {
    initialWord: "which",
  },
};
