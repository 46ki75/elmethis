import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmHeading } from "../typography/elm-heading";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmParagraph } from "../typography/elm-paragraph";
import { ElmToggle } from "./elm-toggle";

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
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
      <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
        <span style={{ "font-family": "monospace" }}>
          isOpen: {String(isOpen())}
        </span>
        <button onClick={() => setIsOpen((previous) => !previous)}>
          Toggle from outside
        </button>
      </div>
      <ElmToggle
        summary="Controlled toggle"
        isOpen={isOpen()}
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
