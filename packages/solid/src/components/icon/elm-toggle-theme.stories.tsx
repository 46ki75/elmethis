import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmToggleTheme } from "./elm-toggle-theme";

const meta = {
  title: "Components/Icon/elm-toggle-theme",
  component: ElmToggleTheme,
  tags: ["autodocs"],
  render: (args) => <ElmToggleTheme {...args} />,
} satisfies Meta<typeof ElmToggleTheme>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
