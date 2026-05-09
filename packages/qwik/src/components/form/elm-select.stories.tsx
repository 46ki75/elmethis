import { $, component$, useSignal } from "@builder.io/qwik";
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

export const Primary: Story = {
  render() {
    return (
      <ElmSelect
        {...this.args}
        label={this.args?.label ?? "Select"}
        options={OPTIONS}
      />
    );
  },
};

export const WithIcon: Story = {
  args: {
    label: "Select with icon",
    icon: <ElmMdiIcon d={mdiAccountOutline} />,
    options: OPTIONS,
  },
  render(args) {
    return <ElmSelect {...args} />;
  },
};

export const Disabled: Story = {
  render() {
    return (
      <ElmSelect
        {...this.args}
        label={this.args?.label ?? "Select"}
        options={OPTIONS}
        disabled={true}
      />
    );
  },
};

export const Loading: Story = {
  render() {
    return (
      <ElmSelect
        {...this.args}
        label={this.args?.label ?? "Select"}
        options={OPTIONS}
        loading={true}
      />
    );
  },
};

const ControlledSelect = component$(() => {
  const selected = useSignal<ElmSelectOption | null>(null);
  const open = useSignal(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmSelect
        label="Controlled select"
        options={OPTIONS}
        selectedOption={selected.value}
        onSelectedOptionChange$={$((option) => {
          selected.value = option;
        })}
        open={open.value}
        onOpenChange$={$((v) => {
          open.value = v;
        })}
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        <div>open: {String(open.value)}</div>
        <div>selected: {selected.value ? selected.value.id : "none"}</div>
      </div>
      <button
        onClick$={() => {
          selected.value = null;
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
