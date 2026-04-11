import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

import pkg from "./package.json";

const { dependencies = {}, devDependencies = {}, peerDependencies = {} } = pkg;
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj: Record<string, unknown>) =>
  Object.keys(obj).map(makeRegex);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/lib.ts"),
      name: "elmethis",
      fileName: "elmethis",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        ...excludeAll(dependencies),
        ...excludeAll(devDependencies),
        ...excludeAll(peerDependencies),
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].mjs",
      },
    },
  },
});
