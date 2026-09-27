import type { StorybookConfig } from "@storybook/vue3-vite";

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
    name: "@storybook/vue3-vite",
    options: {},
  },
  // Components are authored in TSX; ensure the Vue JSX transform runs in the
  // Storybook build (the vue3-vite preset wires up `@vitejs/plugin-vue` but not
  // the JSX plugin).
  viteFinal: async (config) => {
    const { mergeConfig } = await import("vite");
    const { default: vueJsx } = await import("@vitejs/plugin-vue-jsx");
    return mergeConfig(config, {
      plugins: [vueJsx()],
      build: {
        // Older CSS targets make Lightning CSS replace light-dark() with an
        // OS media query, which ignores the theme toolbar's color-scheme.
        cssTarget: ["chrome123", "firefox120", "safari17.5"],
      },
    });
  },
};
export default config;
