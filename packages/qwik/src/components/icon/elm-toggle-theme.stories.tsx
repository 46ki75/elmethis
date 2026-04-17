import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmToggleTheme , type ElmToggleThemeProps} from "./elm-toggle-theme";

const meta: Meta<ElmToggleThemeProps> = {
  title: "Components/Icon/elm-toggle-theme",
  component: ElmToggleTheme,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmToggleThemeProps>;

export const Primary: Story = {};
