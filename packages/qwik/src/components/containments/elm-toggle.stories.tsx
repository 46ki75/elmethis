import { component$, useSignal } from "@qwik.dev/core";
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

const ControlledToggle = component$(() => {
  const isOpen = useSignal(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontFamily: "monospace" }}>
          isOpen: {String(isOpen.value)}
        </span>
        <button onClick$={() => (isOpen.value = !isOpen.value)}>
          Toggle from outside
        </button>
      </div>
      <ElmToggle summary="Controlled toggle" isOpen={isOpen}>
        <ElmHeading level={2}>Body</ElmHeading>
        <ElmParagraph>
          This toggle's open state is controlled by the parent component. You
          can toggle it from outside using the button above.
        </ElmParagraph>
      </ElmToggle>
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledToggle />,
};

import code from "./elm-collapse?raw";
import { ElmCodeBlock } from "../code/elm-code-block";

export const DefaultOpen: Story = {
  render() {
    return (
      <ElmToggle summary="Open by default" defaultIsOpen={true} {...this.args}>
        <ElmCodeBlock language="tsx" code={code} />
      </ElmToggle>
    );
  },
};
