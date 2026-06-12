import { mdiSquareEditOutline } from "@mdi/js";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmButton } from "./elm-button";

const meta = {
  title: "Components/Form/elm-button",
  component: ElmButton,
  tags: ["autodocs"],
  args: {
    isLoading: false,
    block: false,
    disabled: false,
    primary: false,
  },
  argTypes: {
    color: { control: "color" },
  },
  render: (args) => <ElmButton {...args}>elm-button</ElmButton>,
} satisfies Meta<typeof ElmButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Block: Story = {
  args: { block: true },
};

export const Loading: Story = {
  args: { isLoading: true, block: true },
};

export const Flex: Story = {
  args: { block: true },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <ElmButton {...args}>
        <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
        elm-button
      </ElmButton>
      <ElmButton {...args}>
        <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
        elm-button
      </ElmButton>
    </div>
  ),
};

export const Disabled: Story = {
  args: { block: true, disabled: true },
};

export const WithPrimary: Story = {
  args: { block: true },
  render: (args) => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <ElmButton {...args} primary>
        <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
        elm-button
      </ElmButton>
      <ElmButton {...args}>
        <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
        elm-button
      </ElmButton>
    </div>
  ),
};
