import { StorybookConfig } from "storybook-framework-qwik";
import type { InlineConfig } from "vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "storybook-framework-qwik",
  },
  core: {
    renderer: "storybook-framework-qwik",
  },
  stories: [
    // ...rootMain.stories,
    "../src/components/**/*.stories.mdx",
    "../src/components/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  viteFinal: async (config: InlineConfig) => {
    return config;
  },
};

export default config;
