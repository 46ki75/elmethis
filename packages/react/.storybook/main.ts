import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/components/**/*.mdx",
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/hooks/**/*.mdx",
    "../src/hooks/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  staticDirs: ["../public"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      build: {
        // Older CSS targets make Lightning CSS replace light-dark() with an
        // OS media query, which ignores the theme toolbar's color-scheme.
        cssTarget: ["chrome123", "firefox120", "safari17.5"],
      },
    });
  },
};
export default config;
