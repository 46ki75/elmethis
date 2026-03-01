import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTable } from "./elm-table";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableRow } from "./elm-table-row";
import { ElmTableCell } from "./elm-table-cell";

const meta: Meta<typeof ElmTable> = {
  title: "Components/Table/elm-table",
  component: ElmTable,
  tags: ["autodocs"],
  args: {
    caption: "Example Table",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return (
      <ElmTable {...this.args}>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell hasHeader text="Header 1" />
            <ElmTableCell hasHeader text="Header 2" />
            <ElmTableCell hasHeader text="Header 3" />
            <ElmTableCell hasHeader text="Header 4" />
            <ElmTableCell hasHeader text="Header 5" />
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
