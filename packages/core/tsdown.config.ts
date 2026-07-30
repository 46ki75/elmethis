import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    stylelint: "src/style/stylelint.ts",
    tokens: "src/style/token.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  target: "esnext",
  clean: true,
});
