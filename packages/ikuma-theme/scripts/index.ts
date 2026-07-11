import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { format, resolveConfig } from "prettier";
import { buildWindowsTerminal, createTheme } from "./helper.ts";
import { getTheme, type GetThemeOptions } from "./theme.ts";

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

const targets: GetThemeOptions[] = [
  { color: "dark", name: "ikuma-theme" },
  { color: "light", name: "ikuma-theme light" },
];

const windowsTerminal = {
  schemes: targets.map((target) =>
    buildWindowsTerminal(createTheme(target.color), `Ikuma ${target.color}`),
  ),
};

await Promise.all([
  // VS Code extension themes
  ...targets.map((target) =>
    writeJson(
      `dist/vscode-theme/ikuma-theme-${target.color}-color-theme.json`,
      getTheme(target),
    ),
  ),

  // Windows Terminal: both schemes in one fragment for settings.json
  writeJson("dist/windows-terminal/ikuma.json", windowsTerminal),
]);
