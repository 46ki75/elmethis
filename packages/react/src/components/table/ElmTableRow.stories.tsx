import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTableRow } from "./ElmTableRow";
import { ElmTableCell } from "./ElmTableCell";

const meta: Meta<typeof ElmTableRow> = {
  title: "Components/Table/ElmTableRow",
  component: ElmTableRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <table>
      <tbody>
        <ElmTableRow>
          <ElmTableCell>Cell 1</ElmTableCell>
          <ElmTableCell>Cell 2</ElmTableCell>
        </ElmTableRow>
      </tbody>
    </table>
  ),
};
