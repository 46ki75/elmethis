import { mdiSquareEditOutline } from "@mdi/js";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmButton } from "./elm-button";

const meta: Meta<typeof ElmButton> = {
  title: "Components/Form/elm-button",
  component: ElmButton,
  tags: ["autodocs"],
  args: {
    loading: false,
    block: false,
    disabled: false,
    primary: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return <ElmButton {...this.args}>elm-button</ElmButton>;
  },
};

export const Block: Story = {
  args: { block: true },
  render() {
    return <ElmButton {...this.args}>elm-button</ElmButton>;
  },
};

export const Loading: Story = {
  args: { loading: true, block: true },
  render() {
    return <ElmButton {...this.args}>elm-button</ElmButton>;
  },
};

export const Flex: Story = {
  args: { block: true },
  render() {
    return (
      <div style="display: flex; gap: 1rem;">
        <ElmButton {...this.args}>
          <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
          elm-button
        </ElmButton>
        <ElmButton {...this.args}>
          <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
          elm-button
        </ElmButton>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { block: true, disabled: true },
  render() {
    return <ElmButton {...this.args}>elm-button</ElmButton>;
  },
};

export const WithPrimary: Story = {
  args: { block: true },
  render() {
    return (
      <div style="display: flex; gap: 1rem;">
        <ElmButton {...this.args} primary>
          <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
          elm-button
        </ElmButton>
        <ElmButton {...this.args}>
          <ElmMdiIcon d={mdiSquareEditOutline} size="1.25rem" />
          elm-button
        </ElmButton>
      </div>
    );
  },
};
