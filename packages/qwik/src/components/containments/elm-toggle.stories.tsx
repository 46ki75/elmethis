import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmToggle } from "./elm-toggle";
import { ElmHeading } from "../typography/elm-heading";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmInlineText } from "../typography/elm-inline-text";

const meta: Meta<typeof ElmToggle> = {
  title: "Components/Containments/elm-toggle",
  component: ElmToggle,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render() {
    return (
      <ElmToggle {...this.args}>
        <div q:slot="summary">
          <ElmInlineText>Click me to toggle</ElmInlineText>
        </div>
        <div>
          <ElmHeading level={2}>Body</ElmHeading>
          <ElmParagraph>
            This is the body of the toggle. You can put any content here, and it
            will be shown or hidden when you click the summary.
          </ElmParagraph>
        </div>
      </ElmToggle>
    );
  },
};
