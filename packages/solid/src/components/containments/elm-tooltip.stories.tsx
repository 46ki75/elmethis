import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmTooltip } from "./elm-tooltip";

const meta = {
  title: "Components/Containments/elm-tooltip",
  component: ElmTooltip,
  tags: ["autodocs"],
  args: {
    original: "HOVER ME",
    tooltip: "TOOLTIP",
  },
} satisfies Meta<typeof ElmTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const RightAligned: Story = {
  render: (args) => (
    <div style={{ display: "flex", "justify-content": "flex-end" }}>
      <ElmTooltip original={args.original} tooltip={args.tooltip} />
    </div>
  ),
};
