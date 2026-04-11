import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmDesktopWindow } from "./ElmDesktopWindow";
import { ElmParagraph } from "@components/typography/ElmParagraph";

const meta: Meta<typeof ElmDesktopWindow> = {
  title: "Components/Containments/ElmDesktopWindow",
  component: ElmDesktopWindow,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <ElmDesktopWindow>
      <div style={{ padding: "1rem" }}>
        <ElmParagraph>
          This is the content of the desktop window.
        </ElmParagraph>
      </div>
    </ElmDesktopWindow>
  ),
};
