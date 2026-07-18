import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmTable } from "./elm-table";
import { ElmTableBody } from "./elm-table-body";
import { ElmTableCell } from "./elm-table-cell";
import { ElmTableHeader } from "./elm-table-header";
import { ElmTableRow } from "./elm-table-row";

const meta = {
  title: "Components/Table/elm-table",
  component: ElmTable,
  tags: ["autodocs"],
  args: { caption: "Example Table" },
} satisfies Meta<typeof ElmTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const months = ["January", "February", "March", "April", "May", "June"];
const regions = ["North", "South", "East", "West"];

export const Primary: Story = {
  render: (args) => (
    <ElmTable {...args}>
      <ElmTableHeader>
        <ElmTableRow>
          <ElmTableCell text="Header 1" />
          <ElmTableCell text="Header 2" />
          <ElmTableCell text="Header 3" />
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
  ),
};

export const ScrollableWithRowHeader: Story = {
  args: { caption: "Monthly Revenue", hasRowHeader: true },
  render: (args) => (
    <div
      style={{
        "max-width": "360px",
        border: "1px dashed gray",
        padding: "8px",
      }}
    >
      <ElmTable {...args}>
        <ElmTableHeader>
          <ElmTableRow>
            <ElmTableCell text="Region" />
            <For each={months}>{(month) => <ElmTableCell text={month} />}</For>
          </ElmTableRow>
        </ElmTableHeader>
        <ElmTableBody>
          <For each={regions}>
            {(region, row) => (
              <ElmTableRow>
                <ElmTableCell columnIndex={0} text={region} />
                <For each={months}>
                  {(_, column) => (
                    <ElmTableCell
                      columnIndex={column() + 1}
                      text={String((row() + 1) * (column() + 1) * 1000)}
                    />
                  )}
                </For>
              </ElmTableRow>
            )}
          </For>
        </ElmTableBody>
      </ElmTable>
    </div>
  ),
};
