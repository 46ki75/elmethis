import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmToggleTheme } from "./elm-toggle-theme";

const meta: Meta<typeof ElmToggleTheme> = {
  title: "Components/Icon/elm-toggle-theme",
  component: ElmToggleTheme,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
