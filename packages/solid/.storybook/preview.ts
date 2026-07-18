import { createDecorator, type Preview } from "storybook-solidjs-vite";

import "@elmethis/core/tokens.css";
import "./sb.css";

const preview: Preview = {
  parameters: {
    options: {
      showRoots: true,
    },
    docs: {
      iframeHeight: "200px",
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
    createDecorator((Story, context) => {
      const theme = context.globals.theme || "light";

      document.documentElement.style.colorScheme = theme;
      document.documentElement.setAttribute("data-theme", theme);

      return Story();
    }),
  ],
};

export default preview;
