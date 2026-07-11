import { mkdir, copyFile, writeFile, rm, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { format, resolveConfig } from "prettier";
import { getShikiTheme, type GetThemeOptions } from "./theme.ts";

const OUT = "dist/npm";

async function writeJson(file: string, data: unknown) {
  await mkdir(dirname(file), { recursive: true });
  const config = await resolveConfig(file, { editorconfig: true });
  const formatted = await format(JSON.stringify(data), {
    ...config,
    filepath: file,
  });
  await writeFile(file, formatted);
  console.log(`wrote ${file}`);
}

const root = JSON.parse(await readFile("package.json", "utf8"));

const targets: GetThemeOptions[] = [
  { color: "dark", name: "ikuma-theme" },
  { color: "light", name: "ikuma-theme light" },
];

const pkg = {
  name: "@46ki75/ikuma-theme",
  version: root.version,
  description: "Shiki syntax-highlighting themes from ikuma-theme.",
  license: "Apache-2.0",
  author: root.publisher,
  repository: root.repository,
  homepage: root.homepage,
  bugs: root.bugs,
  keywords: ["shiki", "theme", "syntax-highlighting", "ikuma-theme"],
  type: "module",
  exports: {
    "./dark": "./ikuma-dark.json",
    "./light": "./ikuma-light.json",
    "./package.json": "./package.json",
  },
  files: ["ikuma-dark.json", "ikuma-light.json", "README.md", "LICENSE"],
  publishConfig: {
    access: "public",
  },
};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await Promise.all([
  writeJson(`${OUT}/package.json`, pkg),
  ...targets.map((target) =>
    writeJson(`${OUT}/ikuma-${target.color}.json`, getShikiTheme(target)),
  ),
  copyFile("README.md", `${OUT}/README.md`),
  copyFile("LICENSE", `${OUT}/LICENSE`),
]);

console.log(`prepared ${OUT} for npm publish (v${pkg.version})`);
