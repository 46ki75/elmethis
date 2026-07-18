import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const packageDirectory = fileURLToPath(new URL("..", import.meta.url));
const workspaceDirectory = path.resolve(packageDirectory, "../..");
const coreDirectory = path.join(workspaceDirectory, "packages/core");
const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "elmethis-solid-package-"),
);
const tarballDirectory = path.join(temporaryDirectory, "tarballs");
const consumerDirectory = path.join(temporaryDirectory, "consumer");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const solidPackage = await readJson(
  path.join(packageDirectory, "package.json"),
);
const corePackage = await readJson(path.join(coreDirectory, "package.json"));

const run = async (command, args, cwd = consumerDirectory) => {
  try {
    return await execFileAsync(command, args, {
      cwd,
      env: { ...process.env, CI: "true" },
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    if (error.stdout) process.stderr.write(error.stdout);
    if (error.stderr) process.stderr.write(error.stderr);
    throw error;
  }
};

const write = async (relativePath, contents) => {
  const file = path.join(consumerDirectory, relativePath);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
};

const tarballName = ({ name, version }) =>
  `${name.replace(/^@/, "").replaceAll("/", "-")}-${version}.tgz`;

const assertEndsWith = (actual, expected, label) => {
  if (!actual.replaceAll("\\", "/").endsWith(expected)) {
    throw new Error(`${label} resolved to ${actual}, expected ${expected}`);
  }
};

try {
  await mkdir(tarballDirectory, { recursive: true });
  await run(
    "pnpm",
    ["pack", "--pack-destination", tarballDirectory],
    coreDirectory,
  );
  await run(
    "pnpm",
    ["pack", "--pack-destination", tarballDirectory],
    packageDirectory,
  );

  const coreTarball = path.join(tarballDirectory, tarballName(corePackage));
  const solidTarball = path.join(tarballDirectory, tarballName(solidPackage));
  await stat(coreTarball);
  await stat(solidTarball);

  await mkdir(consumerDirectory, { recursive: true });
  await write(
    "package.json",
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "@elmethis/core": `file:${coreTarball}`,
          "@elmethis/solid": `file:${solidTarball}`,
          "happy-dom": solidPackage.devDependencies["happy-dom"],
          "solid-js": solidPackage.devDependencies["solid-js"],
          typescript: solidPackage.devDependencies.typescript,
          vite: solidPackage.devDependencies.vite,
          "vite-plugin-solid":
            solidPackage.devDependencies["vite-plugin-solid"],
        },
      },
      null,
      2,
    )}\n`,
  );

  await run("pnpm", ["install", "--frozen-lockfile=false"]);

  await write(
    "resolve.mjs",
    `console.log(import.meta.resolve("@elmethis/solid"));
console.log(import.meta.resolve("@elmethis/solid/style.css"));
`,
  );
  const defaultResolution = await run(process.execPath, ["resolve.mjs"]);
  const [importEntry, styleEntry] = defaultResolution.stdout.trim().split("\n");
  assertEndsWith(importEntry, "/lib/index.solid.mjs", "ESM import");
  assertEndsWith(styleEntry, "/lib/style.css", "CSS export");

  const solidResolution = await run(process.execPath, [
    "--conditions=solid",
    "resolve.mjs",
  ]);
  assertEndsWith(
    solidResolution.stdout.trim().split("\n")[0],
    "/lib-solid/index.js",
    "Solid condition",
  );

  await write(
    "src/esm.js",
    `import { ElmDivider, ElmInlineIcon, ElmInlineText } from "@elmethis/solid";
import "@elmethis/solid/style.css";
if (typeof ElmDivider !== "function") throw new Error("Missing ElmDivider ESM export");
if (typeof ElmInlineIcon !== "function") throw new Error("Missing ElmInlineIcon ESM export");
if (typeof ElmInlineText !== "function") throw new Error("Missing ElmInlineText ESM export");
export { ElmDivider, ElmInlineIcon, ElmInlineText };
`,
  );
  await write(
    "vite.esm.config.mjs",
    `import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "dist-esm",
    lib: { entry: "src/esm.js", formats: ["es"], fileName: "index" },
  },
});
`,
  );
  await run("pnpm", [
    "exec",
    "vite",
    "build",
    "--config",
    "vite.esm.config.mjs",
  ]);

  await write(
    "index.html",
    `<div id="app"></div><script type="module" src="/src/client.tsx"></script>\n`,
  );
  await write(
    "src/client.tsx",
    `import { render } from "solid-js/web";
import { ElmDivider, ElmInlineText } from "@elmethis/solid";
import "@elmethis/solid/style.css";
const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing app root");
render(() => <><ElmInlineText>client</ElmInlineText><ElmDivider data-package-smoke="client" /></>, root);
`,
  );
  await write(
    "vite.solid.config.mjs",
    `import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
  plugins: [solid()],
  build: { outDir: "dist-solid" },
});
`,
  );
  await run("pnpm", [
    "exec",
    "vite",
    "build",
    "--config",
    "vite.solid.config.mjs",
  ]);

  await write(
    "src/server.tsx",
    `import { renderToString } from "solid-js/web";
import { ElmDivider, ElmInlineText } from "@elmethis/solid";
const html = renderToString(() => <><ElmInlineText bold>ssr</ElmInlineText><ElmDivider data-package-smoke="ssr" /></>);
if (!html.includes("<hr") || !html.includes("data-package-smoke") || !html.includes("ssr")) {
  throw new Error(\`Unexpected SSR output: \${html}\`);
}
console.log(html);
`,
  );
  await write(
    "vite.ssr.config.mjs",
    `import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
export default defineConfig({
  plugins: [solid({ ssr: true })],
  ssr: { noExternal: ["@elmethis/core", "@elmethis/solid"] },
  build: {
    ssr: "src/server.tsx",
    outDir: "dist-ssr",
    rollupOptions: { output: { entryFileNames: "server.mjs" } },
  },
});
`,
  );
  await run("pnpm", [
    "exec",
    "vite",
    "build",
    "--config",
    "vite.ssr.config.mjs",
  ]);
  await run(process.execPath, ["dist-ssr/server.mjs"]);

  await write(
    "cjs-smoke.mjs",
    `import { createRequire } from "node:module";
import { Window } from "happy-dom";
const window = new Window();
Object.assign(globalThis, {
  document: window.document,
  window,
  Node: window.Node,
  HTMLElement: window.HTMLElement,
});
const require = createRequire(import.meta.url);
require.extensions[".css"] = () => {};
const entry = require.resolve("@elmethis/solid");
if (!entry.replaceAll("\\\\", "/").endsWith("/lib/index.solid.cjs")) {
  throw new Error(\`CommonJS resolved to \${entry}\`);
}
const library = require("@elmethis/solid");
if (typeof library.ElmDivider !== "function") throw new Error("Missing ElmDivider CJS export");
if (typeof library.ElmInlineIcon !== "function") throw new Error("Missing ElmInlineIcon CJS export");
if (typeof library.ElmInlineText !== "function") throw new Error("Missing ElmInlineText CJS export");
`,
  );
  await run(process.execPath, ["--conditions=browser", "cjs-smoke.mjs"]);

  await write(
    "src/types.tsx",
    `import {
  ElmDivider,
  ElmInlineIcon,
  ElmInlineText,
  type ElmDividerProps,
  type ElmInlineIconProps,
  type ElmInlineTextProps,
} from "@elmethis/solid";
const props: ElmDividerProps = { class: "consumer", "aria-label": "Divider" };
const iconProps: ElmInlineIconProps = { src: "icon.svg", alt: "Icon" };
const textProps: ElmInlineTextProps = { bold: true, color: "red" };
export const components = <><ElmInlineText {...textProps}>Text</ElmInlineText><ElmInlineIcon {...iconProps} /><ElmDivider {...props} /></>;
`,
  );
  await write(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          customConditions: ["solid"],
          jsx: "preserve",
          jsxImportSource: "solid-js",
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          noUncheckedSideEffectImports: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2023",
        },
        include: ["src/types.tsx"],
      },
      null,
      2,
    )}\n`,
  );
  await run("pnpm", ["exec", "tsc", "--project", "tsconfig.json"]);

  const packedStyle = await readFile(
    path.join(consumerDirectory, "node_modules/@elmethis/solid/lib/style.css"),
    "utf8",
  );
  if (
    !packedStyle.includes("elm-divider") ||
    !packedStyle.includes("elm-inline-icon") ||
    !packedStyle.includes("elm-inline-text") ||
    !packedStyle.includes("--elmethis-color-primary")
  ) {
    throw new Error("Packed style.css does not contain ElmDivider styles");
  }

  console.log("Solid package consumer smoke tests passed.");
} finally {
  if (process.env.KEEP_PACKAGE_TEST !== "true") {
    await rm(temporaryDirectory, { recursive: true, force: true });
  } else {
    console.log(`Package test files retained at ${temporaryDirectory}`);
  }
}
