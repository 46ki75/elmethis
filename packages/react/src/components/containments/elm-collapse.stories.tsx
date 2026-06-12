import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ElmCollapse } from "./elm-collapse";

const meta = {
  title: "Components/Containments/elm-collapse",
  component: ElmCollapse,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmCollapse>;

export default meta;
type Story = StoryObj<typeof meta>;

const PrimaryRender = ({
  direction = "row",
}: {
  direction?: "row" | "column" | "both";
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? "Close" : "Open"} Collapse
      </button>

      <ElmCollapse isOpen={isOpen} direction={direction}>
        <p>
          This is the collapsible content. Toggle the button above to expand or
          collapse it along the {direction} direction.
        </p>
      </ElmCollapse>
    </div>
  );
};

export const Row: Story = {
  render: () => <PrimaryRender direction="row" />,
};

export const Column: Story = {
  render: () => <PrimaryRender direction="column" />,
};

export const Both: Story = {
  render: () => <PrimaryRender direction="both" />,
};
