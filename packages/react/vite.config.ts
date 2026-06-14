/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

import pkg from "./package.json";

const { dependencies = {}, peerDependencies = {} } = pkg as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, string>) =>
  Object.keys(obj).map(makeRegex);

// React Compiler runs at *our* build time and bakes auto-memoization into the
// published output. Consumer build pipelines don't compile node_modules, so
// pre-compiling here is the only way library users benefit — regardless of
// whether they've adopted the compiler themselves. plugin-react v6 (oxc/rolldown
// based for Vite 8) no longer takes a `babel` option, so the compiler is applied
// via @rolldown/plugin-babel + the exported `reactCompilerPreset`. No `target` is
// set: our peer dep is React >=19, whose `react/compiler-runtime` is built in, so
// no `react-compiler-runtime` dependency is needed.
//
// It is intentionally skipped under Vitest so unit/browser specs exercise
// uncompiled source; the compiled output is verified separately via the lib
// build and Storybook.
const reactCompiler = !process.env.VITEST
  ? [babel({ presets: [reactCompilerPreset()] })]
  : [];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...reactCompiler],
  build: {
    outDir: "./lib/",
    target: "es2020",
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      cssFileName: "style.css",
      fileName: (format) => `index.react.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled into the library
      external: [
        /^node:.*/,
        "react",
        "react-dom",
        "react/jsx-runtime",
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
  // The `unit` layer: pure logic, React Testing Library (CSR via jsdom-like
  // happy-dom) and SSR (`renderToString` from `react-dom/server`). Each file
  // may override its environment via a `// @vitest-environment` docblock.
  // Real-browser component specs (`*.browser.spec.tsx`) live in their own
  // config (vitest.browser.config.ts) and are excluded here.
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
    coverage: {
      provider: "v8",
      // Pin the source set explicitly — without `include`, v8 only reports
      // files a test happened to import, so untested modules vanish from the
      // denominator. In Vitest 4, `include` makes uncovered files count at 0%.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.browser.spec.tsx",
        "src/**/*.stories.tsx",
        "src/index.ts", // re-export barrel
      ],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
