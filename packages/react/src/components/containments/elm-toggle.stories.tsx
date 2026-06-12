import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ElmToggle } from "./elm-toggle";
import { ElmHeading } from "../typography/elm-heading";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmInlineText } from "../typography/elm-inline-text";

const meta = {
  title: "Components/Containments/elm-toggle",
  component: ElmToggle,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    monochrome: { control: "boolean" },
  },
} satisfies Meta<typeof ElmToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => (
    <ElmToggle summary="Click me to toggle" {...args}>
      <ElmHeading level={2}>Body</ElmHeading>
      <ElmParagraph>
        This is the body of the toggle. You can put any content here, and it
        will be shown or hidden when you click the summary.
      </ElmParagraph>
    </ElmToggle>
  ),
};

export const CustomSummary: Story = {
  render: (args) => (
    <ElmToggle
      summary={<ElmInlineText>Custom summary content</ElmInlineText>}
      {...args}
    >
      <ElmHeading level={2}>Body</ElmHeading>
      <ElmParagraph>
        This toggle uses a custom summary node instead of the plain string
        summary.
      </ElmParagraph>
    </ElmToggle>
  ),
};

const ControlledToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontFamily: "monospace" }}>
          isOpen: {String(isOpen)}
        </span>
        <button onClick={() => setIsOpen((prev) => !prev)}>
          Toggle from outside
        </button>
      </div>
      <ElmToggle
        summary="Controlled toggle"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <ElmHeading level={2}>Body</ElmHeading>
        <ElmParagraph>
          This toggle's open state is controlled by the parent component. You
          can toggle it from outside using the button above.
        </ElmParagraph>
      </ElmToggle>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledToggle />,
};

export const DefaultOpen: Story = {
  render: (args) => (
    <ElmToggle summary="Open by default" defaultIsOpen {...args}>
      <ElmHeading level={2}>Body</ElmHeading>
      <ElmParagraph>
        This toggle is open by default via the uncontrolled `defaultIsOpen`
        prop.
      </ElmParagraph>
    </ElmToggle>
  ),
};
