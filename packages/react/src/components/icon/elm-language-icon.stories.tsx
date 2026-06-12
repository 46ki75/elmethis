import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmLanguageIcon, LANGUAGES } from "./elm-language-icon";

const meta = {
  title: "Components/Icon/elm-language-icon",
  component: ElmLanguageIcon,
  tags: ["autodocs"],
  args: {
    language: "rust",
  },
  argTypes: {
    language: {
      control: "radio",
      options: LANGUAGES,
    },
  },
} satisfies Meta<typeof ElmLanguageIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { language: "rust" },
};
