import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import preserveDirectives from "rollup-plugin-preserve-directives";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    dts({ tsconfigPath: "./tsconfig.app.json" }),
    preserveDirectives({
      exclude: ["**/*.scss", "**/*.css", "**/*.sass"],
    }),
    cssInjectedByJsPlugin(),
  ],
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@mdi/js",
        // "katex",
        // "lodash-es",
        // "nanoid",
        "polished",
        // "shiki",
        // "mermaid",
        "react-transition-group",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].mjs",
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
    postcss: "./postcss.config.js",
  },
});
