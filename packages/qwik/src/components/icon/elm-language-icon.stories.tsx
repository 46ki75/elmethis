import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmLanguageIcon, LANGUAGES } from "./elm-language-icon";

const meta: Meta<typeof ElmLanguageIcon> = {
  title: "Components/Icon/elm-language-icon",
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

export const Primary: Story = {
  args: { language: "rust" },
};
