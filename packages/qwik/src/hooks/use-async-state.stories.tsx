import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useAsyncState, type UseAsyncStateOptions } from "./use-async-state";

const meta: Meta<UseAsyncStateOptions> = {
  title: "Components/Components/use-async-state",
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<UseAsyncStateOptions>;

export const Primary: Story = {};
