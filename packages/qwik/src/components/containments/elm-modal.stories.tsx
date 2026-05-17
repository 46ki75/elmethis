import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmModal, type ElmModalProps } from "./elm-modal";
import { $, component$, Slot, useSignal } from "@qwik.dev/core";
import { ElmTextField } from "../form/elm-text-field";

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

// Reproduces the bug where clicking an ElmTextField inside a modal
// incorrectly closed the modal.
const RenderWithTextField = component$<ElmModalProps>((args) => {
  const isOpen = useSignal(false);

  const toggle = $(() => {
    isOpen.value = !isOpen.value;
  });

  return (
    <>
      <button onClick$={toggle}>Open Modal</button>
      <ElmModal {...args} isOpen={isOpen.value} onClose$={toggle}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "0.25rem",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <p>Clicking the text field below should NOT close this modal.</p>
          <ElmTextField label="Username" placeholder="Enter username" />
          <ElmTextField label="Password" isPassword placeholder="Enter password" />
        </div>
      </ElmModal>
    </>
  );
});

export const WithTextField: Story = {
  render: (args) => <RenderWithTextField {...args} />,
};
