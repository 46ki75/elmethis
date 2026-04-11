import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmList } from "./ElmList";
import { ElmInlineText } from "./ElmInlineText";

const meta: Meta<typeof ElmList> = {
  title: "Components/Typography/ElmList",
  component: ElmList,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    listStyle: {
      options: ["unordered", "ordered"],
      control: "radio",
    },
  },
  render: (args) => (
    <ElmList {...args}>
      <li>
        <ElmInlineText>Item 1</ElmInlineText>
      </li>
      <li>
        <ElmInlineText>Item 2</ElmInlineText>
      </li>
      <li>
        <ElmInlineText>Item 3</ElmInlineText>
      </li>
    </ElmList>
  ),
};

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
  render: (args) => (
    <ElmList {...args}>
      <li>
        <ElmInlineText>Item 1</ElmInlineText>
      </li>
      <li>
        <ElmInlineText>Item 2</ElmInlineText>
        <ElmList {...args}>
          <li>
            <ElmInlineText>Item 2.1</ElmInlineText>
          </li>
          <li>
            <ElmInlineText>Item 2.2</ElmInlineText>
            <ElmList {...args}>
              <li>
                <ElmInlineText>Item 2.2.1</ElmInlineText>
              </li>
              <li>
                <ElmInlineText>Item 2.2.2</ElmInlineText>
              </li>
              <li>
                <ElmInlineText>Item 2.2.3</ElmInlineText>
              </li>
            </ElmList>
          </li>
          <li>
            <ElmInlineText>Item 2.3</ElmInlineText>
          </li>
        </ElmList>
      </li>
      <li>
        <ElmInlineText>Item 3</ElmInlineText>
      </li>
    </ElmList>
  ),
};
