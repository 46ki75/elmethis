import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmList, type ElmListProps } from "./elm-list";

const meta: Meta<ElmListProps> = {
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
      <ElmList {...(this.args as ElmListProps)}>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ElmList>
    );
  },
};

export default meta;
type Story = StoryObj<ElmListProps>;

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
      <ElmList {...(this.args as ElmListProps)}>
        <li>Item 1</li>
        <li>
          Item 2
          <ElmList {...(this.args as ElmListProps)}>
            <li>Item 2.1</li>
            <li>
              Item 2.2
              <ElmList {...(this.args as ElmListProps)}>
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

export const MixedNested: Story = {
  args: { listStyle: "unordered" },
  render() {
    return (
      <ElmList {...(this.args as ElmListProps)}>
        <li>
          Ingredients
          <ElmList listStyle="ordered">
            <li>Flour</li>
            <li>Sugar</li>
            <li>Eggs</li>
          </ElmList>
        </li>
        <li>
          Steps
          <ElmList listStyle="ordered">
            <li>Preheat oven</li>
            <li>
              Mix batter
              <ElmList listStyle="unordered">
                <li>Combine dry ingredients</li>
                <li>Add wet ingredients</li>
              </ElmList>
            </li>
            <li>Bake</li>
          </ElmList>
        </li>
        <li>Done</li>
      </ElmList>
    );
  },
};
