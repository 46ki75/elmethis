import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { createElmethisTheme } from "./create-elmethis-theme";

const ThemeDemo = () => {
  const theme = createElmethisTheme();

  return (
    <div style={{ display: "grid", gap: "0.75rem", "max-width": "22rem" }}>
      <output>
        Resolved theme:{" "}
        <strong>{theme.isDarkTheme() ? "dark" : "light"}</strong>
      </output>
      <button type="button" onClick={theme.toggleTheme}>
        Pin {theme.isDarkTheme() ? "light" : "dark"} theme
      </button>
      <small>
        The controller updates color-scheme and data-theme on the document root.
      </small>
    </div>
  );
};

const meta = {
  title: "Primitives/createElmethisTheme",
  component: ThemeDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof ThemeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
