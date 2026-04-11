import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTableHeader } from "./ElmTableHeader";
import { ElmTableRow } from "./ElmTableRow";
import { ElmTableCell } from "./ElmTableCell";

const meta: Meta<typeof ElmTableHeader> = {
  title: "Components/Table/ElmTableHeader",
  component: ElmTableHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <table>
      <ElmTableHeader>
        <ElmTableRow>
          <ElmTableCell>Header 1</ElmTableCell>
          <ElmTableCell>Header 2</ElmTableCell>
        </ElmTableRow>
      </ElmTableHeader>
    </table>
  ),
};
