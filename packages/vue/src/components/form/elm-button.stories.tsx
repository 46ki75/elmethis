import { mdiSquareEditOutline } from "@mdi/js";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

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
  render: (args) => ({
    components: { ElmButton },
    setup() {
      return { args };
    },
    template: `<ElmButton v-bind="args">elm-button</ElmButton>`,
  }),
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
  render: (args) => ({
    components: { ElmButton, ElmMdiIcon },
    setup() {
      return { args, mdiSquareEditOutline };
    },
    template: `
      <div style="display: flex; gap: 1rem">
        <ElmButton v-bind="args">
          <ElmMdiIcon :d="mdiSquareEditOutline" size="1.25rem" />
          elm-button
        </ElmButton>
        <ElmButton v-bind="args">
          <ElmMdiIcon :d="mdiSquareEditOutline" size="1.25rem" />
          elm-button
        </ElmButton>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { block: true, disabled: true },
};

export const WithPrimary: Story = {
  args: { block: true },
  render: (args) => ({
    components: { ElmButton, ElmMdiIcon },
    setup() {
      return { args, mdiSquareEditOutline };
    },
    template: `
      <div style="display: flex; gap: 1rem">
        <ElmButton v-bind="args" primary>
          <ElmMdiIcon :d="mdiSquareEditOutline" size="1.25rem" />
          elm-button
        </ElmButton>
        <ElmButton v-bind="args">
          <ElmMdiIcon :d="mdiSquareEditOutline" size="1.25rem" />
          elm-button
        </ElmButton>
      </div>
    `,
  }),
};
