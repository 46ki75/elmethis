import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useModal, type UseModalOptions } from "./useModal";
import { component$, Slot } from "@builder.io/qwik";

const meta: Meta<UseModalOptions> = {
  title: "Hooks/useModal",
  tags: ["autodocs"],
  args: {},
  argTypes: { delay: { control: { type: "number" } } },
};

export default meta;
type Story = StoryObj<UseModalOptions>;

const Render = component$((args: UseModalOptions) => {
  const { Modal, toggle } = useModal(args);

  return (
    <>
      <button onClick$={toggle}>Toggle Modal</button>
      <Modal>
        <Slot />
      </Modal>
    </>
  );
});

export const Primary: Story = {
  render: (args) => {
    return (
      <Render {...args}>
        <p>This is the content of the modal.</p>
      </Render>
    );
  },
};

export const WithStyle: Story = {
  render: (args) => {
    return (
      <Render {...args}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.25rem",
            padding: "1rem",
          }}
        >
          <p>This is the content of the modal.</p>
        </div>
      </Render>
    );
  },
};
