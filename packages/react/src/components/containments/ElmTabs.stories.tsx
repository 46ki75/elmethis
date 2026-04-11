import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTabs } from "./ElmTabs";

const meta: Meta<typeof ElmTabs> = {
  title: "Components/Containments/ElmTabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <ElmTabs
      tabLabels={[
        <span key="1">😎 Tab 1</span>,
        <span key="2">🐱 Tab 2</span>,
        <span key="3">🚀 Tab 3</span>,
      ]}
      tabContents={[
        <div key="1">This is the content for Tab 1.</div>,
        <div key="2">This is the content for Tab 2.</div>,
        <div key="3">This is the content for Tab 3.</div>,
      ]}
    />
  ),
};
