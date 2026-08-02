import { lint } from "@google/design.md/linter";
import prettier from "prettier";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { generateDesignMd, type DesignTheme } from "../src/style/design-md";

const themes = ["light", "dark"] as const satisfies readonly DesignTheme[];
const here = dirname(fileURLToPath(import.meta.url));

for (const theme of themes) {
  const outPath = resolve(here, "..", "dist", "design", theme, "DESIGN.md");
  const config = await prettier.resolveConfig(outPath);
  const output = await prettier.format(generateDesignMd(theme), {
    ...config,
    parser: "markdown",
  });
  const report = lint(output);
  const blockingFindings = report.findings.filter(
    ({ severity }) => severity === "error" || severity === "warning",
  );

  if (blockingFindings.length > 0) {
    const details = blockingFindings
      .map(
        ({ severity, path, message }) =>
          `${severity}: ${path ? `${path}: ` : ""}${message}`,
      )
      .join("\n");
    throw new Error(
      `Generated ${theme} DESIGN.md failed validation:\n${details}`,
    );
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, output);
  console.log(`Wrote ${outPath}`);
}
