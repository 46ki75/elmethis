import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const catalogId =
  "https://46ki75.github.io/elmethis/a2ui/v0_9/notion_block_catalog.json";

// Fresh processes exercise the published entry points, not a test runner's
// module cache or a bundler's tree shaking. Run the package build first.
for (const mode of ["import", "require"]) {
  test(`${mode} exposes the catalog ID without startup warnings`, () => {
    const load =
      mode === "import"
        ? '() => import("@elmethis/core")'
        : '() => require("@elmethis/core")';
    const output = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        `
          import { createRequire } from "node:module";
          const require = createRequire(import.meta.url);
          const warnings = [];
          const originalWarn = console.warn;
          const captureWarn = (...args) => warnings.push(args.map(String).join(" "));
          console.warn = captureWarn;
          const load = ${load};
          const core = await load();
          const firstImport = warnings.length;
          await load();
          const cachedImport = warnings.length - firstImport;
          const firstWarning = warnings[0] ?? null;
          const preservesLogger = console.warn === captureWarn;
          console.warn("unrelated consumer warning");
          const forwardsWarnings = warnings.at(-1) === "unrelated consumer warning";
          console.warn = originalWarn;
          console.log(JSON.stringify({
            catalogId: core.NOTION_BLOCK_CATALOG_ID,
            firstImport,
            cachedImport,
            firstWarning,
            preservesLogger,
            forwardsWarnings,
          }));
        `,
      ],
      {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        encoding: "utf8",
      },
    );

    assert.deepEqual(JSON.parse(output), {
      catalogId,
      firstImport: 0,
      cachedImport: 0,
      firstWarning: null,
      preservesLogger: true,
      forwardsWarnings: true,
    });
  });
}
