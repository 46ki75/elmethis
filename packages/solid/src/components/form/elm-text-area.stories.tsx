import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mdiCommentTextOutline } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmTextArea, type ElmTextAreaProps } from "./elm-text-area";

const meta = {
  title: "Components/Form/elm-text-area",
  component: ElmTextArea,
  tags: ["autodocs"],
  args: {
    label: "Description",
    placeholder: "Tell us what you think...",
    rows: 4,
  },
} satisfies Meta<typeof ElmTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const ControlledTextArea = (props: ElmTextAreaProps) => {
  const [text, setText] = createSignal("");
  const [committed, setCommitted] = createSignal("");

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <ElmTextArea
        {...props}
        value={text()}
        onInput={(event) => setText(event.currentTarget.value)}
        onChange={(event) => setCommitted(event.currentTarget.value)}
      />
      <ElmInlineText>Live: {text()}</ElmInlineText>
      <ElmInlineText>Committed: {committed()}</ElmInlineText>
    </div>
  );
};

export const Primary: Story = {
  args: { maxLength: 200 },
  render: (args) => <ControlledTextArea {...args} />,
};

export const WithIcon: Story = {
  args: {
    label: "Comment",
    icon: <ElmMdiIcon d={mdiCommentTextOutline} size="0.75rem" color="gray" />,
  },
};

export const Uncontrolled: Story = {
  args: { defaultValue: "Initial text", maxLength: 200 },
};

export const Disabled: Story = {
  args: {
    defaultValue: "This field is disabled.\nYou cannot edit it.",
    disabled: true,
  },
};

export const Loading: Story = { args: { isLoading: true } };
