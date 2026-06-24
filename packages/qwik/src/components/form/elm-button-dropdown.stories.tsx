import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
  type ElmButtonDropdownProps,
} from "./elm-button-dropdown";

import MiniMax from "../../assets/images/minimax.svg?url";
import OpenAI from "../../assets/images/openai.svg?url";
import Claude from "../../assets/images/claude.svg?url";

const MODELS: ElmButtonDropdownItem[] = [
  { id: "claude", label: "Claude Opus 4.7", icon: Claude },
  { id: "gpt", label: "GPT-5.4 Mini", icon: OpenAI },
  { id: "minimax", label: "MiniMax M2.5", icon: MiniMax },
];

const meta: Meta<ElmButtonDropdownProps> = {
  title: "Components/Form/elm-button-dropdown",
  component: ElmButtonDropdown,
  tags: ["autodocs"],
  args: {
    label: "Select a model",
  },
};

export default meta;
type Story = StoryObj<ElmButtonDropdownProps>;

const PrimaryDropdown = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmButtonDropdown
      label="Select a model"
      items={MODELS}
      selectedOptionId={selectedOptionId}
    />
  );
});

export const Primary: Story = {
  render: () => <PrimaryDropdown />,
};

const PreselectedDropdown = component$(() => {
  const selectedOptionId = useSignal<string | null>("claude");
  return (
    <ElmButtonDropdown
      label="Select a model"
      items={MODELS}
      selectedOptionId={selectedOptionId}
    />
  );
});

export const Preselected: Story = {
  render: () => <PreselectedDropdown />,
};

const BlockDropdown = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmButtonDropdown
      label="Select a model"
      items={MODELS}
      selectedOptionId={selectedOptionId}
      block
    />
  );
});

export const Block: Story = {
  render: () => <BlockDropdown />,
};

const DisabledDropdown = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmButtonDropdown
      label="Select a model"
      items={MODELS}
      selectedOptionId={selectedOptionId}
      disabled
    />
  );
});

export const Disabled: Story = {
  render: () => <DisabledDropdown />,
};

const LoadingDropdown = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  return (
    <ElmButtonDropdown
      label="Select a model"
      items={MODELS}
      selectedOptionId={selectedOptionId}
      isLoading
    />
  );
});

export const Loading: Story = {
  render: () => <LoadingDropdown />,
};

const ControlledDropdown = component$(() => {
  const selectedOptionId = useSignal<string | null>(null);
  const log = useSignal<string>("none");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmButtonDropdown
        label="Select a model"
        items={MODELS}
        selectedOptionId={selectedOptionId}
        onClick$={(item) => {
          log.value = `run: ${item?.id ?? "none"}`;
        }}
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        <div>selected: {selectedOptionId.value ?? "none"}</div>
        <div>last run: {log.value}</div>
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
  render: () => <ControlledDropdown />,
};
