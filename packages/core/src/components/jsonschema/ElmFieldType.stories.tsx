import type { Meta, StoryObj } from "@storybook/vue3";
import ElmFieldType from "./ElmFieldType.vue";

const meta: Meta<typeof ElmFieldType> = {
  title: "Components/JSONSchema/ElmFieldType",
  component: ElmFieldType,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    type: {
      options: [
        "object",
        "array",
        "string",
        "number",
        "boolean",
        "integer",
        "null",
      ],
      control: { type: "radio" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    type: "object",
    name: "user",
  },
};

export const Maybe: Story = {
  args: {
    type: "object",
    name: "user",
    nullable: true,
  },
};
