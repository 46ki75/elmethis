import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmColumnList } from "./ElmColumnList";
import { ElmColumn } from "./ElmColumn";

const meta: Meta<typeof ElmColumn> = {
  title: "Components/Containments/ElmColumn",
  component: ElmColumn,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <ElmColumnList>
      <ElmColumn>
        <p>Column 1</p>
      </ElmColumn>
      <ElmColumn>
        <p>Column 2</p>
      </ElmColumn>
      <ElmColumn>
        <p>Column 3</p>
      </ElmColumn>
    </ElmColumnList>
  ),
};
