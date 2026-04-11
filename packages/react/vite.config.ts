import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import pkg from "./package.json";

const { dependencies = {}, devDependencies = {}, peerDependencies = {} } = pkg;
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, unknown>) =>
  Object.keys(obj).map(makeRegex);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "./lib/",
    target: "es2020",
    lib: {
      entry: "./src/lib.ts",
      formats: ["es", "cjs"],
      cssFileName: "style.css",
      fileName: (format) => `index.react.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        /^node:.*/,
        "react",
        "react-dom",
        ...excludeAll(dependencies),
        ...excludeAll(devDependencies),
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
});
