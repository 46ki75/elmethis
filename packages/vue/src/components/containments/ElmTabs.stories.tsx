import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmTabs from "./ElmTabs.vue";
import code from "../code/seed/main.rs?raw";
import ElmCodeBlock from "../code/ElmCodeBlock.vue";

const meta: Meta<typeof ElmTabs> = {
  title: "Components/Containments/ElmTabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return {
      components: { ElmTabs, ElmCodeBlock },
      setup(args) {
        return { args, code };
      },
      template: `
          <ElmTabs v-bind="args">
            <template #tabLabels>
              <span>😎 Tab 1</span>
              <span>🐱 Tab 2</span>
              <span>🚀 Tab 3</span>
            </template>

            <template #tabContents>
              <ElmCodeBlock language="rust" :code="code" />
              <div>This is the content for Tab 2.</div>
              <div>This is the content for Tab 3.</div>
            </template>
          </ElmTabs>
        `,
    };
  },
};
