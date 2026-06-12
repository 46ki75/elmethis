import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmPageTop } from "./elm-page-top";

const meta = {
  title: "Components/Navigation/elm-page-top",
  component: ElmPageTop,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    position: { control: "radio", options: ["left", "right"] },
  },
} satisfies Meta<typeof ElmPageTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => (
    <div style={{ height: "300vh", position: "relative" }}>
      <h1>Scroll down to see the button</h1>
      <ElmPageTop {...args} />
    </div>
  ),
};
