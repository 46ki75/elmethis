import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@qwik.dev/core/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import { join } from "node:path";

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
  };
});
