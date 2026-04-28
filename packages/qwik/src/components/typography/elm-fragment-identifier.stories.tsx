import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmFragmentIdentifier,
  type ElmFragmentIdentifierProps,
} from "./elm-fragment-identifier";

const meta: Meta<ElmFragmentIdentifierProps> = {
  title: "Components/Typography/elm-fragment-identifier",
  component: ElmFragmentIdentifier,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmFragmentIdentifierProps>;

export const Primary: Story = {};
