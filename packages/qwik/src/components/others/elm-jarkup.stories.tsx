import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmJarkup } from "./elm-jarkup";
import sampleData from "../../../../vue/src/components/others/ElmJsonComponentRenderer.json";
import { type Component } from "jarkup-ts";

const meta: Meta<typeof ElmJarkup> = {
  title: "Components/Others/elm-jarkup",
  component: ElmJarkup,
  tags: ["autodocs"],
  args: {
    jsonComponents: sampleData as Component[],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
