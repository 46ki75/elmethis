import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Component } from "jarkup-ts";

import { ElmJarkup } from "./elm-jarkup";
import sampleData from "../../../../vue/src/components/others/ElmJsonComponentRenderer.json";

const meta = {
  title: "Components/Others/elm-jarkup",
  component: ElmJarkup,
  tags: ["autodocs"],
  args: {
    jsonComponents: sampleData as Component[],
    skipUnsupportedComponentWarning: false,
  },
} satisfies Meta<typeof ElmJarkup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
