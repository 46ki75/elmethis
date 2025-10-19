import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  stories: [
    "../../vue/src/**/*.mdx",
    "../../vue/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
};
export default config;
