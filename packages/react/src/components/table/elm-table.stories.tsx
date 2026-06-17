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

/**
 * Wide table inside a narrow (mobile-sized) frame. The table scrolls
 * horizontally, edge shadows hint at off-screen columns, and the row-header
 * column stays pinned via `hasRowHeader`. The wrapper becomes a focusable,
 * labeled scroll region while it overflows.
 */
export const ScrollableWithRowHeader: Story = {
  args: { caption: "Monthly Revenue", hasRowHeader: true },
  render: (args) => (
    <div style={{ maxWidth: 360, border: "1px dashed gray", padding: 8 }}>
      <ElmTable {...args}>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell isHeader text="Region" />
            <ElmTableCell isHeader text="January" />
            <ElmTableCell isHeader text="February" />
            <ElmTableCell isHeader text="March" />
            <ElmTableCell isHeader text="April" />
            <ElmTableCell isHeader text="May" />
            <ElmTableCell isHeader text="June" />
          </ElmTableRow>
        </ElmTableHeader>

        <ElmTableBody>
          {["North", "South", "East", "West"].map((region, row) => (
            <ElmTableRow key={region}>
              <ElmTableCell columnIndex={0} text={region} />
              {Array.from({ length: 6 }, (_, col) => (
                <ElmTableCell
                  key={col}
                  columnIndex={col + 1}
                  text={`${(row + 1) * (col + 1) * 1000}`}
                />
              ))}
            </ElmTableRow>
          ))}
        </ElmTableBody>
      </ElmTable>
    </div>
  ),
};

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
