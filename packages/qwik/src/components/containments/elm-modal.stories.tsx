import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmModal, type ElmModalProps } from "./elm-modal";
import { $, component$, Slot, useSignal } from "@builder.io/qwik";

const meta: Meta<ElmModalProps> = {
  title: "Components/Containments/elm-modal",
  component: ElmModal,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmModalProps>;

const RenderPriary = component$<ElmModalProps>((args) => {
  const isOpen = useSignal(false);

  const toggle = $(() => {
    isOpen.value = !isOpen.value;
  });

  return (
    <>
      <button onClick$={toggle}>Toggle Modal</button>
      <ElmModal {...args} isOpen={isOpen.value} onClose$={toggle}>
        <Slot />
      </ElmModal>
    </>
  );
});

export const Primary: Story = {
  render: (args) => (
    <RenderPriary {...args}>
      <p>This is the content of the modal.</p>
    </RenderPriary>
  ),
};

export const WithStyle: Story = {
  render: (args) => (
    <RenderPriary {...args}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.25rem",
          padding: "1rem",
        }}
      >
        <p>This is the content of the modal.</p>
      </div>
    </RenderPriary>
  ),
};
