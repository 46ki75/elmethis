import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmColorTable, type ElmColorTableProps } from "./elm-color-table";
import { component$ } from "@qwik.dev/core";

const meta: Meta<ElmColorTableProps> = {
  title: "Components/Others/elm-color-table",
  component: ElmColorTable,
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<ElmColorTableProps>;

export const Primary: Story = {
  render: (args) => {
    const Render = component$(() => {
      return <ElmColorTable {...args} />;
    });
    return <Render />;
  },
  args: {
    colors: [
      { name: "brown", code: "#a17c5b" },
      { name: "crimson", code: "#c56565" },
      { name: "amber", code: "#d48b70" },
      { name: "gold", code: "#cdb57b" },
      { name: "emerald", code: "#59b57c" },
      { name: "blue", code: "#6987b8" },
      { name: "purple", code: "#9771bd" },
      { name: "pink", code: "#c9699e" },
      { name: "slate", code: "#868e9c" },
    ],
  },
};
