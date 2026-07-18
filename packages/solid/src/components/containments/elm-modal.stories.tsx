import { createSignal, type JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmModal, type ElmModalProps } from "./elm-modal";

const meta = {
  title: "Components/Containments/elm-modal",
  component: ElmModal,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalExample = (
  props: Pick<ElmModalProps, "delay"> & { children?: JSX.Element },
) => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      <ElmModal
        isOpen={isOpen()}
        delay={props.delay}
        onClose={() => setIsOpen(false)}
      >
        {props.children}
      </ElmModal>
    </>
  );
};

export const Primary: Story = {
  render: (args) => (
    <ModalExample delay={args.delay}>
      <div style={{ "background-color": "white", padding: "1rem" }}>
        <p>This is the content of the modal.</p>
        <button type="button">Content control</button>
      </div>
    </ModalExample>
  ),
};

export const WithFields: Story = {
  render: (args) => (
    <ModalExample delay={args.delay}>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "0.75rem",
          "background-color": "white",
          padding: "1rem",
        }}
      >
        <label>
          Username
          <input type="text" placeholder="Enter username" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Enter password" />
        </label>
      </div>
    </ModalExample>
  ),
};
