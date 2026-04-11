import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTableBody } from "./ElmTableBody";
import { ElmTableRow } from "./ElmTableRow";
import { ElmTableCell } from "./ElmTableCell";

const meta: Meta<typeof ElmTableBody> = {
  title: "Components/Table/ElmTableBody",
  component: ElmTableBody,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <table>
      <ElmTableBody>
        <ElmTableRow>
          <ElmTableCell>Cell 1</ElmTableCell>
          <ElmTableCell>Cell 2</ElmTableCell>
        </ElmTableRow>
        <ElmTableRow>
          <ElmTableCell>Cell 3</ElmTableCell>
          <ElmTableCell>Cell 4</ElmTableCell>
        </ElmTableRow>
      </ElmTableBody>
    </table>
  ),
};
