import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmButton } from "./ElmButton";

const meta: Meta<typeof ElmButton> = {
  title: "Components/Form/ElmButton",
  component: ElmButton,
  tags: ["autodocs"],
  args: {
    onClick: () => console.log("clicked"),
  },
  render: (args) => <ElmButton {...args}>elm-button</ElmButton>,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Block: Story = {
  args: { block: true },
};

export const Loading: Story = {
  args: { loading: true, block: true },
};

export const Disabled: Story = {
  args: { block: true, disabled: true },
};

export const WithPrimary: Story = {
  args: { block: true },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <ElmButton {...args} primary>
        elm-button
      </ElmButton>
      <ElmButton {...args}>elm-button</ElmButton>
    </div>
  ),
};
