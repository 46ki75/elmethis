import { build } from "esbuild";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { z } from "zod";

rmSync("dist", { recursive: true, force: true });

await build({
  entryPoints: { index: "src/server.ts", login: "src/codex-login.ts" },
  outdir: "dist",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  target: "es2024",
  format: "esm",
  banner: {
    js: `import { createRequire as __cjsRequire } from "module"; const require = __cjsRequire(import.meta.url);`,
  },
});

// Codex resolves a platform-native executable at runtime; it cannot be bundled
// into the server. Containers install their own target architecture's package.
const manifest = z
  .object({ dependencies: z.object({ "@openai/codex": z.string() }) })
  .parse(JSON.parse(readFileSync("package.json", "utf8")));
writeFileSync(
  "dist/package.json",
  JSON.stringify(
    {
      private: true,
      type: "module",
      dependencies: { "@openai/codex": manifest.dependencies["@openai/codex"] },
    },
    null,
    2,
  ) + "\n",
);
