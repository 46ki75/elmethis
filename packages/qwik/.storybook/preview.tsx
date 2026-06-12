import type { Preview, StoryContext } from "storybook-framework-qwik";
import type { Component } from "@qwik.dev/core";

import "@elmethis/core/tokens.css";
import "./sb.css";

export const preview: Preview = {
  parameters: {
    a11y: {
      config: {},
      options: {
        checks: { "color-contrast": { options: { noScroll: true } } },
        restoreScroll: true,
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story: Component, context: StoryContext) => {
      const theme = context.globals.theme || "light";
      // `color-scheme` drives the native light-dark() token resolution;
      // `data-theme` covers the few non-color overrides that can't use it.
      document.documentElement.style.colorScheme = theme;
      document.documentElement.setAttribute("data-theme", theme);

      return <Story />;
    },
  ],
};

export default preview;
