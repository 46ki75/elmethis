import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmTable } from "./elm-table";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableRow } from "./elm-table-row";
import { ElmTableCell } from "./elm-table-cell";

const meta = {
  title: "Components/Table/elm-table",
  component: ElmTable,
  tags: ["autodocs"],
  args: {
    caption: "Example Table",
  },
} satisfies Meta<typeof ElmTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wide table inside a narrow (mobile-sized) frame. The table scrolls
 * horizontally, edge shadows hint at off-screen columns, and the row-header
 * column stays pinned via `hasRowHeader`. The wrapper becomes a focusable,
 * labeled scroll region while it overflows.
 */
export const ScrollableWithRowHeader: Story = {
  args: { caption: "Monthly Revenue", hasRowHeader: true },
  render: (args) => ({
    components: {
      ElmTable,
      ElmTableHeader,
      ElmTableBody,
      ElmTableRow,
      ElmTableCell,
    },
    setup() {
      const regions = ["North", "South", "East", "West"];
      const months = ["January", "February", "March", "April", "May", "June"];
      const cell = (row: number, col: number) =>
        String((row + 1) * (col + 1) * 1000);
      return { args, regions, months, cell };
    },
    template: `
      <div :style="{ maxWidth: '360px', border: '1px dashed gray', padding: '8px' }">
        <ElmTable v-bind="args">
          <ElmTableHeader>
            <ElmTableRow>
              <ElmTableCell is-header text="Region" />
              <ElmTableCell v-for="m in months" :key="m" is-header :text="m" />
            </ElmTableRow>
          </ElmTableHeader>
          <ElmTableBody>
            <ElmTableRow v-for="(region, row) in regions" :key="region">
              <ElmTableCell :column-index="0" :text="region" />
              <ElmTableCell
                v-for="(m, col) in months"
                :key="m"
                :column-index="col + 1"
                :text="cell(row, col)"
              />
            </ElmTableRow>
          </ElmTableBody>
        </ElmTable>
      </div>
    `,
  }),
};

export const Primary: Story = {
  render: (args) => ({
    components: {
      ElmTable,
      ElmTableHeader,
      ElmTableBody,
      ElmTableRow,
      ElmTableCell,
    },
    setup() {
      return { args };
    },
    template: `
      <ElmTable v-bind="args">
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell is-header text="Header 1" />
            <ElmTableCell is-header text="Header 2" />
            <ElmTableCell is-header text="Header 3" />
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody>
          <ElmTableRow>
            <ElmTableCell text="Row 1, Cell 1" />
            <ElmTableCell text="Row 1, Cell 2" />
            <ElmTableCell text="Row 1, Cell 3" />
          </ElmTableRow>
          <ElmTableRow>
            <ElmTableCell text="Row 2, Cell 1" />
            <ElmTableCell text="Row 2, Cell 2" />
            <ElmTableCell text="Row 2, Cell 3" />
          </ElmTableRow>
        </ElmTableBody>
      </ElmTable>
    `,
  }),
};
