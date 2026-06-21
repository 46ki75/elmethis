import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    scenarios: "src/scenarios/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  target: "esnext",
  clean: true,
});
