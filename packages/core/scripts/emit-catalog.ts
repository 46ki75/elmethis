/**
 * Method B — write the assembled block catalog to a JSON file alongside the
 * tsdown build artifacts. Imports `blockCatalogJson` directly from source
 * (tsx compiles on demand), so the script is decoupled from tsdown's
 * output filenames and can run standalone for inspection.
 *
 * Output: `dist/a2ui/v0_9/block_catalog.json`. The `files` array in
 * `package.json` covers `dist/`, so the JSON is published to npm. The
 * `pages-deploy` workflow also copies it into the GitHub Pages output so it
 * is fetchable at the URL declared by `BLOCK_CATALOG_ID`. The versioned
 * subpath leaves room for `dist/a2ui/v0_10/...` to land alongside without
 * file moves once v0.10 lands.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  BLOCK_CATALOG_ID,
  blockCatalogJson,
} from "../src/a2ui/v0_9/block-catalog-json";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(
  here,
  "..",
  "dist",
  "a2ui",
  "v0_9",
  "block_catalog.json",
);

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(blockCatalogJson, null, 2) + "\n");

console.log(`wrote ${outPath}`);
console.log(`  catalogId: ${BLOCK_CATALOG_ID}`);
