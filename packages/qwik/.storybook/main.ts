import { StorybookConfig } from "storybook-framework-qwik";
import type { InlineConfig } from "vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "storybook-framework-qwik",
  },
  stories: [
    // ...rootMain.stories,
    "../src/components/**/*.stories.mdx",
    "../src/components/**/*.stories.@(js|jsx|ts|tsx)",
    "../src/hooks/**/*.stories.mdx",
    "../src/hooks/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  viteFinal: async (config: InlineConfig, { configType }) => {
    // qwikVite emits q-chunks under `/build/` and CSS under `/assets/` as
    // root-absolute URLs, so the bundle 404s when served from a subpath
    // (GitHub Pages publishes this site under `/elmethis/qwik/`). Vue and
    // React Storybooks use relative `./` paths and don't need this.
    if (configType === "PRODUCTION") {
      config.base = process.env.STORYBOOK_BASE_PATH ?? "/elmethis/qwik/";
    }
    return config;
  },
};

export default config;
