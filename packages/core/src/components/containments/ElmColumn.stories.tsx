import type { Meta, StoryObj } from "@storybook/vue3";
import ElmColumnList from "./ElmColumnList.vue";
import ElmColumn from "./ElmColumn.vue";

const meta: Meta<typeof ElmColumnList> = {
  title: "Components/Containments/ElmColumnList",
  component: ElmColumnList,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => ({
    components: { ElmColumnList, ElmColumn },
    template: `
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
    `,
  }),
};
