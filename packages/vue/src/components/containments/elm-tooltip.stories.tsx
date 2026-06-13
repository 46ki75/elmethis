import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmTooltip } from "./elm-tooltip";

const meta = {
  title: "Components/Containments/elm-tooltip",
  component: ElmTooltip,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => ({
    components: { ElmTooltip },
    template: `
      <ElmTooltip>
        <template #original><span>HOVER ME</span></template>
        <template #tooltip><span>TOOLTIP</span></template>
      </ElmTooltip>
    `,
  }),
};
