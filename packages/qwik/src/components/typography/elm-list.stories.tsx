import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmList } from "./elm-list";

const meta: Meta<typeof ElmList> = {
  title: "Components/Typography/elm-list",
  component: ElmList,
  tags: ["autodocs"],
  argTypes: {
    listStyle: {
      options: ["unordered", "ordered"],
      control: "radio",
    },
  },
  render() {
    return (
      <ElmList {...this.args}>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ElmList>
    );
  },
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
  render() {
    return (
      <ElmList {...this.args}>
        <li>Item 1</li>
        <li>
          Item 2
          <ElmList {...this.args}>
            <li>Item 2.1</li>
            <li>
              Item 2.2
              <ElmList {...this.args}>
                <li>Item 2.2.1</li>
                <li>Item 2.2.2</li>
                <li>Item 2.2.3</li>
              </ElmList>
            </li>
            <li>Item 2.3</li>
          </ElmList>
        </li>
        <li>Item 3</li>
      </ElmList>
    );
  },
};
