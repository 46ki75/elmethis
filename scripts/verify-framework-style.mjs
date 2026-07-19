import { readFile } from "node:fs/promises";
import path from "node:path";

const packageDirectory = path.resolve(process.argv[2] ?? ".");
const manifest = JSON.parse(
  await readFile(path.join(packageDirectory, "package.json"), "utf8"),
);
const styleExport = manifest.exports?.["./style.css"]?.default;

if (typeof styleExport !== "string") {
  throw new Error(`${manifest.name} does not export ./style.css`);
}

const style = await readFile(
  path.resolve(packageDirectory, styleExport),
  "utf8",
);
const tokenDeclarationIndex = style.search(/--elmethis-color-primary\s*:/);
const componentStyleIndex = style.indexOf("elm-divider");

if (tokenDeclarationIndex < 0) {
  throw new Error(
    `${manifest.name} style.css does not contain core token declarations`,
  );
}

if (componentStyleIndex < 0) {
  throw new Error(
    `${manifest.name} style.css does not contain component styles`,
  );
}

if (tokenDeclarationIndex > componentStyleIndex) {
  throw new Error(
    `${manifest.name} style.css does not place core tokens before component styles`,
  );
}

console.log(`${manifest.name} style.css is self-contained.`);
