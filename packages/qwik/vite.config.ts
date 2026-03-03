import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
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
          "@builder.io/qwik",
          "@builder.io/qwik/jsx-runtime",
          "@builder.io/qwik/build",
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
