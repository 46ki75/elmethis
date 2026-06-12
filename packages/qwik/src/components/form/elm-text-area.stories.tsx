import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTextArea, type ElmTextAreaProps } from "./elm-text-area";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiCommentTextOutline } from "@mdi/js";
import { ElmHeading } from "../typography/elm-heading";
import { useDebouncedSignal } from "../../hooks/use-debounced-signal";

const meta: Meta<ElmTextAreaProps> = {
  title: "Components/Form/elm-text-area",
  component: ElmTextArea,
  tags: ["autodocs"],
  args: {
    label: "Description",
    placeholder: "Tell us what you think...",
    rows: 4,
  },
};

export default meta;
type Story = StoryObj<ElmTextAreaProps>;

const PrimaryTextArea = component$((props: ElmTextAreaProps) => {
  const text = useSignal<string>("");
  return (
    <div>
      <ElmTextArea {...props} value={text} />
      <ElmTextArea {...props} value={text} />
      <ElmInlineText>{text.value}</ElmInlineText>
    </div>
  );
});

export const Primary: Story = {
  args: {
    label: "Description",
    maxLength: 200,
    placeholder: "Tell us what you think...",
    rows: 4,
    required: false,
  },
  render: (props) => <PrimaryTextArea {...props} />,
};

const WithIconTextArea = component$(() => {
  const text = useSignal<string>("");
  return (
    <div>
      <ElmTextArea
        label="Comment"
        placeholder="Leave a comment"
        value={text}
        rows={5}
      >
        <ElmMdiIcon
          q:slot="icon"
          d={mdiCommentTextOutline}
          size="0.75rem"
          color="gray"
        />
      </ElmTextArea>
      <ElmInlineText>{text.value}</ElmInlineText>
    </div>
  );
});

export const WithIcon: Story = {
  render: () => <WithIconTextArea />,
};

const DisabledTextArea = component$(() => {
  const text = useSignal<string>(
    "This field is read-only.\nYou cannot edit me.",
  );
  return (
    <ElmTextArea
      label="Description"
      placeholder="Tell us what you think..."
      value={text}
      disabled={true}
      rows={4}
    />
  );
});

export const Disabled: Story = {
  render: () => <DisabledTextArea />,
};

const LoadingTextArea = component$(() => {
  const text = useSignal<string>("");
  return (
    <ElmTextArea
      label="Description"
      placeholder="Tell us what you think..."
      value={text}
      isLoading={true}
      rows={4}
    />
  );
});

export const Loading: Story = {
  render: () => <LoadingTextArea />,
};

export const Debounced: Story = {
  render: (props) => {
    const Render = component$((props: ElmTextAreaProps) => {
      const { signal, debouncedSignal } = useDebouncedSignal("", 500);

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ElmHeading level={2}>Immediate Value: {signal.value}</ElmHeading>
          <ElmTextArea {...props} value={signal} />
          <ElmHeading level={2}>
            Debounced Value: {debouncedSignal.value}
          </ElmHeading>
          <ElmTextArea {...props} value={debouncedSignal} />
        </div>
      );
    });

    return <Render {...props} />;
  },
};
