import { build } from "esbuild";
import { readdirSync, rm } from "node:fs";

const cwd = readdirSync(".");

if (cwd.includes("dist")) {
  rm("dist", { recursive: true, force: true }, (err) => {
    if (err) {
      console.error("Error removing dist directory:", err);
    } else {
      console.log("dist directory removed successfully.");
    }
  });
}

const result = await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.mjs",
  bundle: true,
  platform: "node",
  target: "es2024",
  format: "esm",
  external: ["@copilotkit/runtime"],
  banner: {
    js: `import { createRequire as __cjsRequire } from "module"; const require = __cjsRequire(import.meta.url);`,
  },
});

console.log(result);
