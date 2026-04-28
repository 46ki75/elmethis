import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmLanguageIcon,
  LANGUAGES,
  type ElmLanguageIconProps,
} from "./elm-language-icon";

const meta: Meta<ElmLanguageIconProps> = {
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
type Story = StoryObj<ElmLanguageIconProps>;

export const Primary: Story = {
  args: { language: "rust" },
};
