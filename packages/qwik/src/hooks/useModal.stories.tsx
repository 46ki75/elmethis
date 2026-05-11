import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useModal, type UseModalOptions } from "./useModal";
import { component$, Slot } from "@builder.io/qwik";
import { ElmTextField } from "../components/form/elm-text-field";

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

// Reproduces the bug where clicking an ElmTextField inside a modal
// incorrectly closed the modal.
const RenderWithTextField = component$((args: UseModalOptions) => {
  const { Modal, toggle } = useModal(args);

  return (
    <>
      <button onClick$={toggle}>Open Modal</button>
      <Modal>
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
      </Modal>
    </>
  );
});

export const WithTextField: Story = {
  render: (args) => <RenderWithTextField {...args} />,
};
