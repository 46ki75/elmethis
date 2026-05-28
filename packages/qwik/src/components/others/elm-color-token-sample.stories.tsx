import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmColorTokenSample,
  type ElmColorTokenSampleProps,
} from "./elm-color-token-sample";

const meta: Meta<ElmColorTokenSampleProps> = {
  title: "Components/Others/elm-color-token-sample",
  component: ElmColorTokenSample,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmColorTokenSampleProps>;

export const Primary: Story = {};
