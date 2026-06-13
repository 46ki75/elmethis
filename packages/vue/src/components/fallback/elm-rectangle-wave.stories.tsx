import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmRectangleWave } from "./elm-rectangle-wave";

const meta = {
  title: "Components/Fallback/elm-rectangle-wave",
  component: ElmRectangleWave,
  tags: ["autodocs"],
  args: {},
  render: (args) => ({
    components: { ElmRectangleWave },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 100%; aspect-ratio: 2/1; margin: 0; position: relative;">
        <ElmRectangleWave v-bind="args" />
      </div>
    `,
  }),
} satisfies Meta<typeof ElmRectangleWave>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
