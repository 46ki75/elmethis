import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmAuthChangePassword from "./ElmAuthChangePassword.vue";

const meta: Meta<typeof ElmAuthChangePassword> = {
  title: "Cognito/Components/ElmAuthChangePassword",
  component: ElmAuthChangePassword,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const validators = [
  {
    label: "Password must be at least 8 characters",
    fn: (input: string) => input.length >= 8,
  },
  {
    label: "Password must contain a number",
    fn: (input: string) => /.*\d+.*/.test(input),
  },
  {
    label: "Password must contain an lower letter",
    fn: (input: string) => /.*[a-z]+.*/.test(input),
  },
  {
    label: "Password must contain an uppercase letter",
    fn: (input: string) => /.*[A-Z]+.*/.test(input),
  },
];

export const Primary: Story = {
  args: { validators },
};
