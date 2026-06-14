import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@qwik.dev/core/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, any>) =>
  Object.keys(obj).map(makeRegex);

export default defineConfig(() => {
  return {
    plugins: [qwikVite(), tsconfigPaths({ root: "." })],
    build: {
      target: "es2020",
      lib: {
        entry: "./src/index.ts",
        formats: ["es", "cjs"],
        cssFileName: "style.css",
        fileName: (format) => `index.qwik.${format === "es" ? "mjs" : "cjs"}`,
      },
      rollupOptions: {
        // externalize deps that shouldn't be bundled into the library
        external: [
          /^node:.*/,
          "@qwik.dev/core",
          "@qwik.dev/core/jsx-runtime",
          "@qwik.dev/core/build",
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
    css: {},
    // The `unit` layer: pure logic + createDOM test-util specs (each file
    // picks its own environment via a `// @vitest-environment` docblock).
    // Real-browser component specs (`*.browser.spec.tsx`) live in their own
    // config (vitest.browser.config.ts) and are excluded here.
    test: {
      // Qwik's createDOM + QRL resolution can exceed the 5s default when the
      // unit suite runs concurrently under load.
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
        // files a test happened to import, so untested modules silently vanish
        // from the denominator and inflate the percentage. In Vitest 4, setting
        // `include` makes never-imported files count at 0% by default.
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.spec.{ts,tsx}",
          "src/**/*.browser.spec.tsx",
          "src/**/*.stories.tsx",
          "src/index.ts", // root re-export barrel, no logic
        ],
        reporter: ["text", "html", "lcov"],
        reportsDirectory: "coverage",
      },
    },
  };
});
