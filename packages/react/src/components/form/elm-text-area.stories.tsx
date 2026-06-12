import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiCommentTextOutline } from "@mdi/js";

import { ElmTextArea } from "./elm-text-area";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmHeading } from "../typography/elm-heading";
import { useDebouncedSignal } from "../../hooks/use-debounced-signal";

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

const PrimaryStory = (props: ComponentProps<typeof ElmTextArea>) => {
  const [text, setText] = useState("");
  return (
    <div>
      <ElmTextArea
        {...props}
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
      />
      <ElmTextArea
        {...props}
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
      />
      <ElmInlineText>{text}</ElmInlineText>
    </div>
  );
};

export const Primary: Story = {
  args: {
    label: "Description",
    maxLength: 200,
    placeholder: "Tell us what you think...",
    rows: 4,
    required: false,
  },
  render: (props) => <PrimaryStory {...props} />,
};

const WithIconStory = () => {
  const [text, setText] = useState("");
  return (
    <div>
      <ElmTextArea
        label="Comment"
        placeholder="Leave a comment"
        value={text}
        onInput={(e) => setText(e.currentTarget.value)}
        rows={5}
        icon={
          <ElmMdiIcon d={mdiCommentTextOutline} size="0.75rem" color="gray" />
        }
      />
      <ElmInlineText>{text}</ElmInlineText>
    </div>
  );
};

export const WithIcon: Story = {
  render: () => <WithIconStory />,
};

export const Disabled: Story = {
  render: () => (
    <ElmTextArea
      label="Description"
      placeholder="Tell us what you think..."
      defaultValue={"This field is read-only.\nYou cannot edit me."}
      disabled
      rows={4}
    />
  ),
};

const LoadingStory = () => {
  const [text, setText] = useState("");
  return (
    <ElmTextArea
      label="Description"
      placeholder="Tell us what you think..."
      value={text}
      onInput={(e) => setText(e.currentTarget.value)}
      isLoading
      rows={4}
    />
  );
};

export const Loading: Story = {
  render: () => <LoadingStory />,
};

const DebouncedStory = (props: ComponentProps<typeof ElmTextArea>) => {
  const { value, setValue, debouncedValue } = useDebouncedSignal("", 500);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmHeading level={2}>Immediate Value: {value}</ElmHeading>
      <ElmTextArea
        {...props}
        value={value}
        onInput={(e) => setValue(e.currentTarget.value)}
      />
      <ElmHeading level={2}>Debounced Value: {debouncedValue}</ElmHeading>
      <ElmTextArea {...props} value={debouncedValue} readOnly />
    </div>
  );
};

export const Debounced: Story = {
  render: (props) => <DebouncedStory {...props} />,
};
