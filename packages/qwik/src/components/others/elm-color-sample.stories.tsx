import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmColorSample, type ElmColorSampleProps } from "./elm-color-sample";

const meta: Meta<ElmColorSampleProps> = {
  title: "Components/Others/elm-color-sample",
  component: ElmColorSample,
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<ElmColorSampleProps>;

export const Primary: Story = {
  args: {
    color: "#59b57c",
  },
};
