import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmJarkup } from "./ElmJarkup";
import sampleData from "../../../../vue/src/components/others/ElmJsonComponentRenderer.json";
import type { Component } from "jarkup-ts";

const meta: Meta<typeof ElmJarkup> = {
  title: "Components/Others/ElmJarkup",
  component: ElmJarkup,
  tags: ["autodocs"],
  args: {
    jsonComponents: sampleData as Component[],
    skipUnsupportedComponentWarning: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const CustomRenderer: Story = {
  args: {
    renderFunctionMap: {
      Paragraph: (component, render) => {
        return (
          <p style={{ background: "black", color: "white" }}>
            {render(component.slots.default)}
          </p>
        );
      },
    },
  },
};
