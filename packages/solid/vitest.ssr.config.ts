/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Solid compiles JSX differently for DOM and server output. Keep SSR specs in
// the unit layer, but transform them separately with the server compiler.
export default defineConfig({
  plugins: [solid({ ssr: true })],
  test: {
    name: "ssr",
    environment: "node",
    include: ["src/**/*.ssr.spec.tsx"],
  },
});
