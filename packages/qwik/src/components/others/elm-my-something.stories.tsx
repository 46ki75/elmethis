import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmMySomething } from "./elm-my-something";

const meta: Meta<typeof ElmMySomething> = {
  title: "Components/<Category>/elm-my-something",
  component: ElmMySomething,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
