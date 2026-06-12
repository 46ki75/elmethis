import { build } from "esbuild";
import { vanillaExtractPlugin } from "@vanilla-extract/esbuild-plugin";
import prettier from "prettier";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Compiles `src/style/token.css.ts` with vanilla-extract and writes the
 * extracted stylesheet to `dist/tokens.css`. We only want the CSS, so the
 * bundle is produced in-memory (`write: false`) and the JS entry is discarded.
 */
const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const entry = path.join(root, "src/style/token.css.ts");
const outFile = path.join(root, "dist/tokens.css");

const result = await build({
  entryPoints: [entry],
  bundle: true,
  write: false,
  outdir: path.join(root, "dist"),
  plugins: [vanillaExtractPlugin()],
  logLevel: "warning",
});

const css = result.outputFiles.find((file: { path: string }) =>
  file.path.endsWith(".css"),
);
if (!css) {
  throw new Error("vanilla-extract produced no CSS output");
}

// Strip vanilla-extract's leading `/* vanilla-extract-css-ns:… */` annotation;
// it is only meaningful to the bundler integration, not a standalone file.
const stripped = css.text.replace(
  /^\/\* vanilla-extract-css-ns:[\s\S]*?\*\/\n/,
  "",
);

// Format with the project's prettier config so the artifact matches house style.
const config = await prettier.resolveConfig(outFile);
const output = await prettier.format(stripped, {
  ...config,
  parser: "css",
});

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, output);
console.log(`Wrote dist/tokens.css (${output.length} bytes)`);
