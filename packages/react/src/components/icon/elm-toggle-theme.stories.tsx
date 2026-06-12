import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmToggleTheme } from "./elm-toggle-theme";

const meta = {
  title: "Components/Icon/elm-toggle-theme",
  component: ElmToggleTheme,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmToggleTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
