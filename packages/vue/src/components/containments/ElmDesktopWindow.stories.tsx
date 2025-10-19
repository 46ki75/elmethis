import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmDesktopWindow from "./ElmDesktopWindow.vue";
import ElmParagraph from "../typography/ElmParagraph.vue";

const meta: Meta<typeof ElmDesktopWindow> = {
  title: "Components/Containments/ElmDesktopWindow",
  component: ElmDesktopWindow,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => ({
    components: { ElmDesktopWindow, ElmParagraph },
    template: `<ElmDesktopWindow>
      <div style="padding: 1rem;">
        <ElmParagraph>
          This is the content of the desktop window.
        </ElmParagraph>
      </div>
    </ElmDesktopWindow>`,
  }),
};
