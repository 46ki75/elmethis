import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmCollapse, type ElmCollapseProps } from "./elm-collapse";

import code from "./elm-collapse.stories?raw";
import { $, component$, useSignal } from "@qwik.dev/core";
import { ElmButton } from "../form/elm-button";
import { ElmCodeBlock } from "../code/elm-code-block";

const meta: Meta<ElmCollapseProps> = {
  title: "Components/Containments/elm-collapse",
  component: ElmCollapse,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmCollapseProps>;

const PrimaryRender = component$(
  ({ direction = "row" }: { direction?: "row" | "column" | "both" }) => {
    const isOpen = useSignal(false);
    const toggle = $(() => {
      isOpen.value = !isOpen.value;
    });

    return (
      <div>
        <ElmButton block onClick$={toggle}>
          {isOpen.value ? "Close" : "Open"} Collapse
        </ElmButton>

        <ElmCollapse isOpen={isOpen.value} direction={direction}>
          <ElmCodeBlock language="tsx" code={code} />
        </ElmCollapse>
      </div>
    );
  },
);

export const Row: Story = {
  render() {
    return <PrimaryRender direction="row" />;
  },
};

export const Column: Story = {
  render() {
    return <PrimaryRender direction="column" />;
  },
};

export const Both: Story = {
  render() {
    return <PrimaryRender direction="both" />;
  },
};
