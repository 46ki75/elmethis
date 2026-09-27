import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const packageDirectory = path.resolve(process.argv[2] ?? ".");
const assetsDirectory = path.join(
  packageDirectory,
  "storybook-static",
  "assets",
);
const cssFiles = (await readdir(assetsDirectory)).filter((file) =>
  file.endsWith(".css"),
);
const stylesheets = await Promise.all(
  cssFiles.map(async (file) => ({
    file,
    content: await readFile(path.join(assetsDirectory, file), "utf8"),
  })),
);
const tokenStylesheet = stylesheets.find(({ content }) =>
  content.includes("--elmethis-color-surface-base:"),
);

if (!tokenStylesheet) {
  throw new Error("Storybook output does not contain Elmethis theme tokens");
}

if (!tokenStylesheet.content.includes("light-dark(")) {
  throw new Error(
    `${tokenStylesheet.file} does not preserve light-dark(); forced Storybook themes will not work`,
  );
}

if (tokenStylesheet.content.includes("--lightningcss-light")) {
  throw new Error(
    `${tokenStylesheet.file} contains Lightning CSS's prefers-color-scheme fallback`,
  );
}

console.log("Storybook output preserves switchable Elmethis theme tokens.");
