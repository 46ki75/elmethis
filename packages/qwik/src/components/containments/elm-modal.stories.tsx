import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmModal, type ElmModalProps } from "./elm-modal";
import { $, component$, useSignal } from "@builder.io/qwik";

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
      <ElmModal {...args} isOpen={isOpen.value} onClose$={toggle} />
    </>
  );
});

export const Primary: Story = {
  render: (args) => <RenderPriary {...args} />,
};
