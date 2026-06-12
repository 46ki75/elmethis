import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { ElmModal, type ElmModalProps } from "./elm-modal";

// NOTE: the qwik twin imports `ElmTextField` here; that component has not yet
// been ported to react (Wave 2), so this story uses native inputs to keep the
// same "clicking a field inside the modal must NOT close it" reproduction.

const meta = {
  title: "Components/Containments/elm-modal",
  component: ElmModal,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const RenderPrimary = ({
  children,
  ...args
}: ElmModalProps & { children?: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button onClick={toggle}>Toggle Modal</button>
      <ElmModal {...args} isOpen={isOpen} onClose={toggle}>
        {children}
      </ElmModal>
    </>
  );
};

export const Primary: Story = {
  render: (args) => (
    <RenderPrimary {...args}>
      <p>This is the content of the modal.</p>
    </RenderPrimary>
  ),
};

export const WithStyle: Story = {
  render: (args) => (
    <RenderPrimary {...args}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.25rem",
          padding: "1rem",
        }}
      >
        <p>This is the content of the modal.</p>
      </div>
    </RenderPrimary>
  ),
};

// Reproduces the bug where clicking an ElmTextField inside a modal
// incorrectly closed the modal.
const RenderWithTextField = (args: ElmModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      <ElmModal {...args} isOpen={isOpen} onClose={toggle}>
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
            <input type="text" placeholder="Enter username" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Enter password" />
          </label>
        </div>
      </ElmModal>
    </>
  );
};

export const WithTextField: Story = {
  render: (args) => <RenderWithTextField {...args} />,
};
