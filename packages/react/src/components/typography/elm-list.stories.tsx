import type { Meta, StoryObj } from "@storybook/react-vite";
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
  render: (args) => (
    <ElmList {...args}>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ElmList>
  ),
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
  render: (args) => (
    <ElmList {...args}>
      <li>Item 1</li>
      <li>
        Item 2
        <ElmList {...args}>
          <li>Item 2.1</li>
          <li>
            Item 2.2
            <ElmList {...args}>
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
  ),
};

export const MixedNested: Story = {
  args: { listStyle: "unordered" },
  render: (args) => (
    <ElmList {...args}>
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
  ),
};
