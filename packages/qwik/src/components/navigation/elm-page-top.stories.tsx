import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmPageTop } from "./elm-page-top";

const meta: Meta<typeof ElmPageTop> = {
  title: "Components/Navigation/elm-page-top",
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
  render() {
    return (
      <div style={{ height: "300vh", position: "relative" }}>
        <h1>Scroll down to see the button</h1>
        <ElmPageTop {...this.args} />
      </div>
    );
  },
};
