import type { StorybookConfig } from "storybook-solidjs-vite";

const config = {
  stories: [
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/primitives/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "storybook-solidjs-vite",
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
} satisfies StorybookConfig;

export default config;
