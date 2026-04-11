import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmLanguageIcon } from "./ElmLanguageIcon";
import { LANGUAGES } from "./language";

const meta: Meta<typeof ElmLanguageIcon> = {
  title: "Components/Icon/ElmLanguageIcon",
  component: ElmLanguageIcon,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    language: {
      control: "radio",
      options: LANGUAGES,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
