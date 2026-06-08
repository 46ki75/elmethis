import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmColorSemanticSample,
  type ElmColorSemanticSampleProps,
} from "./elm-color-semantic-sample";

const meta: Meta<ElmColorSemanticSampleProps> = {
  title: "Components/Others/elm-color-semantic-sample",
  component: ElmColorSemanticSample,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmColorSemanticSampleProps>;

export const Primary: Story = {};
