import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmJarkup } from "./elm-jarkup";

const meta: Meta<typeof ElmJarkup> = {
  title: "Components/Others/elm-jarkup",
  component: ElmJarkup,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
