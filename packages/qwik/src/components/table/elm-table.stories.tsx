import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTable, type ElmTableProps } from "./elm-table";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableRow } from "./elm-table-row";
import { ElmTableCell } from "./elm-table-cell";

const meta: Meta<ElmTableProps> = {
  title: "Components/Table/elm-table",
  component: ElmTable,
  tags: ["autodocs"],
  args: {
    caption: "Example Table",
  },
};

export default meta;
type Story = StoryObj<ElmTableProps>;

/**
 * Wide table inside a narrow (mobile-sized) frame. The table scrolls
 * horizontally, edge shadows hint at off-screen columns, and the row-header
 * column stays pinned via `hasRowHeader`. The wrapper becomes a focusable,
 * labeled scroll region while it overflows.
 */
export const ScrollableWithRowHeader: Story = {
  args: { caption: "Monthly Revenue", hasRowHeader: true },
  render() {
    const regions = ["North", "South", "East", "West"];
    const months = ["January", "February", "March", "April", "May", "June"];
    return (
      <div
        style={{ maxWidth: "360px", border: "1px dashed gray", padding: "8px" }}
      >
        <ElmTable {...this.args}>
          <ElmTableHeader>
            <ElmTableRow>
              <ElmTableCell isHeader text="Region" />
              {months.map((month) => (
                <ElmTableCell key={month} isHeader text={month} />
              ))}
            </ElmTableRow>
          </ElmTableHeader>

          <ElmTableBody>
            {regions.map((region, row) => (
              <ElmTableRow key={region}>
                <ElmTableCell columnIndex={0} text={region} />
                {months.map((month, col) => (
                  <ElmTableCell
                    key={month}
                    columnIndex={col + 1}
                    text={`${(row + 1) * (col + 1) * 1000}`}
                  />
                ))}
              </ElmTableRow>
            ))}
          </ElmTableBody>
        </ElmTable>
      </div>
    );
  },
};

export const Primary: Story = {
  render() {
    return (
      <ElmTable {...this.args}>
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
    );
  },
};
