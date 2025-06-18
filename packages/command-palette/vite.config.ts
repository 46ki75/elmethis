import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: "./tsconfig.app.json" }),
    cssInjectedByJsPlugin({
      relativeCSSInjection: true,
    }),
  ],
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "index",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "@elmethis/core", "@mdi/js", "@vueuse/core", "fuse.js"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].mjs",
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
    postcss: "./postcss.config.js",
  },
});
