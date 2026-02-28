import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

const meta: Meta<typeof ElmFragmentIdentifier> = {
  title: "Components/Typography/elm-fragment-identifier",
  component: ElmFragmentIdentifier,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
