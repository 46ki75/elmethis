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
