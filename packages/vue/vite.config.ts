/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

import pkg from "./package.json";

const { dependencies = {}, peerDependencies = {} } = pkg as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, string>) =>
  Object.keys(obj).map(makeRegex);

// Components are authored in TSX and compiled to Vue render functions by
// `@vitejs/plugin-vue-jsx`. `@vitejs/plugin-vue` is kept too so a stray `.vue`
// SFC (or Storybook's expectations) still resolve, even though the library is
// JSX-only by convention.
//
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    outDir: "./lib/",
    target: "es2020",
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      cssFileName: "style.css",
      fileName: (format) => `index.vue.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled into the library
      external: [
        /^node:.*/,
        "vue",
        "vue/jsx-runtime",
        ...excludeAll(dependencies),
        ...excludeAll(peerDependencies),
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith(".css")) {
            return "style.css";
          }
          return "assets/[name].[hash][extname]";
        },
      },
    },
  },
  // The `unit` layer: pure logic, Vue Test Utils (CSR via happy-dom) and SSR
  // (`renderToString` from `vue/server-renderer`). Each file may override its
  // environment via a `// @vitest-environment` docblock. Real-browser component
  // specs (`*.browser.spec.tsx`) live in their own config
  // (vitest.browser.config.ts) and are excluded here.
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 20000,
    exclude: [
      "**/*.browser.spec.tsx",
      "**/node_modules/**",
      "**/lib/**",
      "**/dist/**",
    ],
  },
});
