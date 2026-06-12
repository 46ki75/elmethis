import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmSelect,
  type ElmSelectOption,
  type ElmSelectProps,
} from "./elm-select";

import MiniMax from "../../assets/images/minimax.svg?url";
import OpenAI from "../../assets/images/openai.svg?url";
import Claude from "../../assets/images/claude.svg?url";
import { mdiAccountOutline } from "@mdi/js";
import { ElmMdiIcon } from "../..";

const OPTIONS: ElmSelectOption[] = [
  {
    id: "minimax/minimax-m2.5",
    label: "MiniMax: MiniMax M2.5",
    icon: MiniMax,
  },
  {
    id: "minimax/minimax-m2.7",
    label: "MiniMax: MiniMax M2.7",
    icon: MiniMax,
  },
  {
    id: "openai/gpt-5.4-nano",
    label: "OpenAI: GPT-5.4 Nano",
    icon: OpenAI,
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "OpenAI: GPT-5.4 Mini",
    icon: OpenAI,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Anthropic: Claude Sonnet 4.6",
    icon: Claude,
  },
  {
    id: "anthropic/claude-opus-4.7",
    label: "Anthropic: Claude Opus 4.7",
    icon: Claude,
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
    <ElmSelect
      label="Select"
      options={OPTIONS}
      selectedOptionId={selectedOptionId}
    />
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
      options={OPTIONS}
      selectedOptionId={selectedOptionId}
    >
      <ElmMdiIcon q:slot="icon" d={mdiAccountOutline} />
    </ElmSelect>
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
      isLoading={true}
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
