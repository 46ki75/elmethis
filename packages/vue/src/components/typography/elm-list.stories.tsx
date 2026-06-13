import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmList } from "./elm-list";

const meta = {
  title: "Components/Typography/elm-list",
  component: ElmList,
  tags: ["autodocs"],
  argTypes: {
    listStyle: {
      options: ["unordered", "ordered"],
      control: "radio",
    },
  },
  render: (args) => ({
    components: { ElmList },
    setup() {
      return { args };
    },
    template: `
      <ElmList v-bind="args">
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ElmList>
    `,
  }),
} satisfies Meta<typeof ElmList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unordered: Story = {
  args: { listStyle: "unordered" },
};

export const Ordered: Story = {
  args: { listStyle: "ordered" },
};

export const Nested: Story = {
  args: { listStyle: "unordered" },
  render: (args) => ({
    components: { ElmList },
    setup() {
      return { args };
    },
    template: `
      <ElmList v-bind="args">
        <li>Item 1</li>
        <li>
          Item 2
          <ElmList v-bind="args">
            <li>Item 2.1</li>
            <li>
              Item 2.2
              <ElmList v-bind="args">
                <li>Item 2.2.1</li>
                <li>Item 2.2.2</li>
              </ElmList>
            </li>
            <li>Item 2.3</li>
          </ElmList>
        </li>
        <li>Item 3</li>
      </ElmList>
    `,
  }),
};
