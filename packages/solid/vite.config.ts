/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import pkg from "./package.json";

const { dependencies = {}, peerDependencies = {} } = pkg as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const makeRegex = (dependency: string) =>
  new RegExp(`^${dependency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:/.*)?$`);
const externalDependencies = [dependencies, peerDependencies].flatMap(
  (dependencyGroup) => Object.keys(dependencyGroup).map(makeRegex),
);

export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: "./lib",
    target: "es2020",
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      cssFileName: "style",
      fileName: (format) => `index.solid.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [/^node:.*/, ...externalDependencies],
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["@testing-library/jest-dom/vitest", "./vitest.setup.ts"],
    testTimeout: 20000,
    exclude: [
      "**/*.browser.spec.tsx",
      "**/*.ssr.spec.tsx",
      "**/node_modules/**",
      "**/lib/**",
      "**/lib-solid/**",
      "**/dist/**",
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.browser.spec.tsx",
        "src/**/*.ssr.spec.tsx",
        "src/**/*.stories.tsx",
        "src/index.ts",
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
