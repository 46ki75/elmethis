import type { StorybookConfig } from "storybook-solidjs-vite";

const config = {
  stories: ["../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "storybook-solidjs-vite",
    options: {},
  },
} satisfies StorybookConfig;

export default config;
