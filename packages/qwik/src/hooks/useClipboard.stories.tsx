import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useClipboard, type UseClipboardOptions } from "./useClipboard";
import { component$ } from "@builder.io/qwik";

const meta: Meta<UseClipboardOptions> = {
  title: "Hooks/useClipboard",
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<UseClipboardOptions>;

export const Primary: Story = {
  args: { content: "Hello, World!" },
  render: (args) => {
    const Render = component$((options: UseClipboardOptions) => {
      const { CopyButton } = useClipboard(options);

      return (
        <div>
          <CopyButton />
        </div>
      );
    });

    return <Render {...args} />;
  },
};
