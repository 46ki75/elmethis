import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { useModal, type UseModalOptions } from "./use-modal";

const meta = {
  title: "Hooks/useModal",
  tags: ["autodocs"],
  args: {},
  argTypes: { delay: { control: { type: "number" } } },
} satisfies Meta<UseModalOptions>;

export default meta;
type Story = StoryObj<UseModalOptions>;

const Render = (props: UseModalOptions & { children?: ReactNode }) => {
  const { children, ...args } = props;
  const { Modal, toggle } = useModal(args);

  return (
    <>
      <button onClick={toggle}>Toggle Modal</button>
      <Modal>{children}</Modal>
    </>
  );
};

export const Primary: Story = {
  render: (args) => (
    <Render {...args}>
      <p>This is the content of the modal.</p>
    </Render>
  ),
};

export const WithStyle: Story = {
  render: (args) => (
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
  ),
};

// Reproduces the bug where clicking a text field inside a modal
// incorrectly closed the modal.
const RenderWithTextField = (args: UseModalOptions) => {
  const { Modal, toggle } = useModal(args);

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
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
          <label>
            Username
            <input placeholder="Enter username" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter password" />
          </label>
        </div>
      </Modal>
    </>
  );
};

export const WithTextField: Story = {
  render: (args) => <RenderWithTextField {...args} />,
};
