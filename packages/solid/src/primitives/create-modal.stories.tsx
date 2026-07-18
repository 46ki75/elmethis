import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { createModal, type CreateModalOptions } from "./create-modal";

const meta = {
  title: "Primitives/createModal",
  tags: ["autodocs"],
  args: { delay: 200 },
  argTypes: { delay: { control: { type: "number" } } },
} satisfies Meta<CreateModalOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

const Example = (props: CreateModalOptions) => {
  const { Modal, toggle } = createModal(props);

  return (
    <>
      <button type="button" onClick={toggle}>
        Toggle Modal
      </button>
      <Modal>
        <div style={{ "background-color": "white", padding: "1rem" }}>
          This modal is controlled by createModal.
        </div>
      </Modal>
    </>
  );
};

export const Primary: Story = {
  render: (args) => <Example {...(args as CreateModalOptions)} />,
};
