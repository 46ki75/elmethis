import { $, component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmSelect,
  type ElmSelectOption,
  type ElmSelectProps,
} from "./elm-select";

const OPTIONS: ElmSelectOption[] = [
  {
    id: "1",
    label: "banana",
    description: "A yellow fruit that's high in potassium.",
  },
  {
    id: "2",
    label: "apple",
    description: "A sweet red or green fruit often eaten raw.",
  },
  {
    id: "3",
    label: "orange",
    description: "A citrus fruit known for its vitamin C content.",
  },
  {
    id: "4",
    label: "grape",
    description: "A small, juicy fruit often used to make wine.",
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
      <ElmSelect {...this.args} label={this.args?.label ?? "Select"} options={OPTIONS} />
    );
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
        <div>
          selected:{" "}
          {selected.value ? selected.value.label : "none"}
        </div>
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
