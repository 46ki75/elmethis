import { component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmSelect,
  type ElmSelectOption,
  type ElmSelectProps,
} from "./elm-select";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import MiniMax from "../../assets/images/minimax.svg?url";
import OpenAI from "../../assets/images/openai.svg?url";
import Claude from "../../assets/images/claude.svg?url";
import { mdiAccountOutline } from "@mdi/js";
import { ElmMdiIcon } from "../..";

const Model = component$((props: { icon: string; text: string }) => {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <ElmInlineIcon src={props.icon} />
      <ElmInlineText>{props.text}</ElmInlineText>
    </div>
  );
});

const OPTIONS: ElmSelectOption[] = [
  {
    id: "minimax/minimax-m2.5",
    slot: <Model icon={MiniMax} text="MiniMax: MiniMax M2.5" />,
  },
  {
    id: "minimax/minimax-m2.7",
    slot: <Model icon={MiniMax} text="MiniMax: MiniMax M2.7" />,
  },
  {
    id: "openai/gpt-5.4-nano",
    slot: <Model icon={OpenAI} text="OpenAI: GPT-5.4 Nano" />,
  },
  {
    id: "openai/gpt-5.4-mini",
    slot: <Model icon={OpenAI} text="OpenAI: GPT-5.4 Mini" />,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    slot: <Model icon={Claude} text="Anthropic: Claude Sonnet 4.6" />,
  },
  {
    id: "anthropic/claude-opus-4.7",
    slot: <Model icon={Claude} text="Anthropic: Claude Opus 4.7" />,
  },
];

const meta: Meta<ElmSelectProps> = {
  title: "Components/Form/elm-select",
  component: ElmSelect,
  tags: ["autodocs"],
  args: {
    label: "Select",
  },
};

export default meta;
type Story = StoryObj<ElmSelectProps>;

const PrimarySelect = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmSelect label="Select" options={OPTIONS} selectedOptionId={selectedOptionId} />
  );
});

export const Primary: Story = {
  render: () => <PrimarySelect />,
};

const WithIconSelect = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmSelect
      label="Select with icon"
      icon={<ElmMdiIcon d={mdiAccountOutline} />}
      options={OPTIONS}
      selectedOptionId={selectedOptionId}
    />
  );
});

export const WithIcon: Story = {
  render: () => <WithIconSelect />,
};

const DisabledSelect = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmSelect
      label="Select"
      options={OPTIONS}
      selectedOptionId={selectedOptionId}
      disabled={true}
    />
  );
});

export const Disabled: Story = {
  render: () => <DisabledSelect />,
};

const LoadingSelect = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmSelect
      label="Select"
      options={OPTIONS}
      selectedOptionId={selectedOptionId}
      loading={true}
    />
  );
});

export const Loading: Story = {
  render: () => <LoadingSelect />,
};

const ControlledSelect = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmSelect
        label="Controlled select"
        options={OPTIONS}
        selectedOptionId={selectedOptionId}
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        <div>selected: {selectedOptionId.value ?? "none"}</div>
      </div>
      <button
        onClick$={() => {
          selectedOptionId.value = null;
        }}
      >
        Clear selection
      </button>
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledSelect />,
};
