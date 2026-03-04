import { component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmSelect,
  type ElmSelectOption,
  type ElmSelectProps,
} from "./elm-select";

const meta: Meta<typeof ElmSelect> = {
  title: "Components/Form/elm-select",
  component: ElmSelect,
  tags: ["autodocs"],
  args: {
    label: "Select",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SelectWrapper = component$(
  (props: Partial<ElmSelectProps> & { label?: string }) => {
    const options: ElmSelectOption[] = [
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
    const selected = useSignal<ElmSelectOption | null>(null);

    return (
      <ElmSelect
        label={props.label || "Select"}
        {...props}
        options={options}
        selectedOption={selected} // Pass signal for two-way binding or control
      />
    );
  },
);

export const Primary: Story = {
  render() {
    return <SelectWrapper {...this.args} />;
  },
};
