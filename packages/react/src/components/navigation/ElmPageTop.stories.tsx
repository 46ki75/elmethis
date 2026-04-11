import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmPageTop } from "./ElmPageTop";

const meta: Meta<typeof ElmPageTop> = {
  title: "Components/Navigation/ElmPageTop",
  component: ElmPageTop,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    position: { control: "radio", options: ["left", "right"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => (
    <div style={{ height: "1000vh" }}>
      <ElmPageTop {...args} />
    </div>
  ),
};
