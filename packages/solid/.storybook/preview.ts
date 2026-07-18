import type { Preview } from "storybook-solidjs-vite";

import "@elmethis/core/tokens.css";

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
};

export default preview;
