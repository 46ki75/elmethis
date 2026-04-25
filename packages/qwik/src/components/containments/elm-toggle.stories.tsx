import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmToggle, type ElmToggleProps } from "./elm-toggle";
import { ElmHeading } from "../typography/elm-heading";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmInlineText } from "../typography/elm-inline-text";

const meta: Meta<ElmToggleProps> = {
  title: "Components/Containments/elm-toggle",
  component: ElmToggle,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    monochrome: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<ElmToggleProps>;

export const Primary: Story = {
  render() {
    return (
      <ElmToggle summary="Click me to toggle" {...this.args}>
        <ElmHeading level={2}>Body</ElmHeading>
        <ElmParagraph>
          This is the body of the toggle. You can put any content here, and it
          will be shown or hidden when you click the summary.
        </ElmParagraph>
      </ElmToggle>
    );
  },
};

export const CustomSummary: Story = {
  render() {
    return (
      <ElmToggle {...this.args}>
        <div q:slot="summary">
          <ElmInlineText>Custom summary content</ElmInlineText>
        </div>
        <ElmHeading level={2}>Body</ElmHeading>
        <ElmParagraph>
          This toggle uses a named slot for custom summary content.
        </ElmParagraph>
      </ElmToggle>
    );
  },
};

import code from "./elm-collapse?raw";
import { ElmCodeBlock } from "../code/elm-code-block";

export const DefaultOpen: Story = {
  render() {
    return (
      <ElmToggle summary="Open by default" isOpen={true} {...this.args}>
        <ElmCodeBlock language="tsx" code={code} />
      </ElmToggle>
    );
  },
};
