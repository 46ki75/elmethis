import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTableCell } from "./ElmTableCell";

const meta: Meta<typeof ElmTableCell> = {
  title: "Components/Table/ElmTableCell",
  component: ElmTableCell,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <table>
      <tbody>
        <tr>
          <ElmTableCell>Regular cell</ElmTableCell>
          <ElmTableCell hasHeader>Header cell</ElmTableCell>
        </tr>
      </tbody>
    </table>
  ),
};
