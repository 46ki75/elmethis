import type { Meta, StoryObj } from "@storybook/react-vite";
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
  render: (args) => (
    <ElmTable {...args}>
      <ElmTableHeader>
        <ElmTableRow>
          <ElmTableCell isHeader text="Header 1" />
          <ElmTableCell isHeader text="Header 2" />
          <ElmTableCell isHeader text="Header 3" />
          <ElmTableCell isHeader text="Header 4" />
          <ElmTableCell isHeader text="Header 5" />
        </ElmTableRow>
      </ElmTableHeader>

      <ElmTableBody>
        <ElmTableRow>
          <ElmTableCell text="Row 1, Cell 1" />
          <ElmTableCell text="Row 1, Cell 2" />
          <ElmTableCell text="Row 1, Cell 3" />
          <ElmTableCell text="Row 1, Cell 4" />
          <ElmTableCell text="Row 1, Cell 5" />
        </ElmTableRow>
        <ElmTableRow>
          <ElmTableCell text="Row 2, Cell 1" />
          <ElmTableCell text="Row 2, Cell 2" />
          <ElmTableCell text="Row 2, Cell 3" />
          <ElmTableCell text="Row 2, Cell 4" />
          <ElmTableCell text="Row 2, Cell 5" />
        </ElmTableRow>
        <ElmTableRow>
          <ElmTableCell text="Row 3, Cell 1" />
          <ElmTableCell text="Row 3, Cell 2" />
          <ElmTableCell text="Row 3, Cell 3" />
          <ElmTableCell text="Row 3, Cell 4" />
          <ElmTableCell text="Row 3, Cell 5" />
        </ElmTableRow>
        <ElmTableRow>
          <ElmTableCell text="Row 4, Cell 1" />
          <ElmTableCell text="Row 4, Cell 2" />
          <ElmTableCell text="Row 4, Cell 3" />
          <ElmTableCell text="Row 4, Cell 4" />
          <ElmTableCell text="Row 4, Cell 5" />
        </ElmTableRow>
      </ElmTableBody>
    </ElmTable>
  ),
};
