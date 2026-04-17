import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmJarkup , type ElmJarkupProps} from "./elm-jarkup";
import sampleData from "../../../../vue/src/components/others/ElmJsonComponentRenderer.json";
import { type Component } from "jarkup-ts";

const meta: Meta<ElmJarkupProps> = {
  title: "Components/Others/elm-jarkup",
  component: ElmJarkup,
  tags: ["autodocs"],
  args: {
    jsonComponents: sampleData as Component[],
    skipUnsupportedComponentWarning: false,
  },
};

export default meta;
type Story = StoryObj<ElmJarkupProps>;

export const Primary: Story = {};
