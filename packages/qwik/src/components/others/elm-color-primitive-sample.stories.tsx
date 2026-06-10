import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmColorPrimitiveSample,
  type ElmColorPrimitiveSampleProps,
} from "./elm-color-primitive-sample";

const meta: Meta<ElmColorPrimitiveSampleProps> = {
  title: "Components/Others/elm-color-primitive-sample",
  component: ElmColorPrimitiveSample,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmColorPrimitiveSampleProps>;

export const Primary: Story = {};
