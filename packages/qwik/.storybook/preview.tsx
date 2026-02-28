import { Parameters, StoryContext } from "storybook-framework-qwik";

import "./sb.scss";
import { Component } from "@builder.io/qwik";

export const parameters: Parameters = {
  a11y: {
    config: {},
    options: {
      checks: { "color-contrast": { options: { noScroll: true } } },
      restoreScroll: true,
    },
  },
  options: {
    showRoots: true,
  },
  docs: {
    iframeHeight: "200px",
  },

  parameters: {
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
      document.documentElement.setAttribute("data-theme", theme);

      return <Story />;
    },
  ],
};
