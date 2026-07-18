import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: "./lib",
    target: "es2020",
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => `index.solid.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        /^node:.*/,
        /^solid-js(?:\/.*)?$/,
        /^@elmethis\/core(?:\/.*)?$/,
      ],
    },
  },
});
