import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTable } from "./ElmTable";
import { ElmTableHeader } from "./ElmTableHeader";
import { ElmTableBody } from "./ElmTableBody";
import { ElmTableRow } from "./ElmTableRow";
import { ElmTableCell } from "./ElmTableCell";

const meta: Meta<typeof ElmTable> = {
  title: "Components/Table/ElmTable",
  component: ElmTable,
  tags: ["autodocs"],
  args: {
    caption: "Example Table",
    header: (
      <ElmTableHeader>
        <ElmTableRow>
          <ElmTableCell hasHeader>Header 1</ElmTableCell>
          <ElmTableCell hasHeader>Header 2</ElmTableCell>
          <ElmTableCell hasHeader>Header 3</ElmTableCell>
        </ElmTableRow>
      </ElmTableHeader>
    ),
    body: (
      <ElmTableBody>
        <ElmTableRow>
          <ElmTableCell>Row 1, Cell 1</ElmTableCell>
          <ElmTableCell>Row 1, Cell 2</ElmTableCell>
          <ElmTableCell>Row 1, Cell 3</ElmTableCell>
        </ElmTableRow>
        <ElmTableRow>
          <ElmTableCell>Row 2, Cell 1</ElmTableCell>
          <ElmTableCell>Row 2, Cell 2</ElmTableCell>
          <ElmTableCell>Row 2, Cell 3</ElmTableCell>
        </ElmTableRow>
        <ElmTableRow>
          <ElmTableCell>Row 3, Cell 1</ElmTableCell>
          <ElmTableCell>Row 3, Cell 2</ElmTableCell>
          <ElmTableCell>Row 3, Cell 3</ElmTableCell>
        </ElmTableRow>
      </ElmTableBody>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const NoCaption: Story = {
  args: {
    caption: undefined,
  },
};
