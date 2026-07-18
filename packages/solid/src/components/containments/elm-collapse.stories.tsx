import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmCollapse, type ElmCollapseProps } from "./elm-collapse";

const meta = {
  title: "Components/Containments/elm-collapse",
  component: ElmCollapse,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmCollapse>;

export default meta;
type Story = StoryObj<typeof meta>;

const PrimaryRender = (props: Pick<ElmCollapseProps, "direction">) => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen() ? "Close" : "Open"} Collapse
      </button>
      <ElmCollapse isOpen={isOpen()} direction={props.direction}>
        <p>
          This is the collapsible content. Toggle the button above to expand or
          collapse it along the {props.direction} direction.
        </p>
      </ElmCollapse>
    </div>
  );
};

export const Row: Story = { render: () => <PrimaryRender direction="row" /> };

export const Column: Story = {
  render: () => <PrimaryRender direction="column" />,
};

export const Both: Story = {
  render: () => <PrimaryRender direction="both" />,
};
