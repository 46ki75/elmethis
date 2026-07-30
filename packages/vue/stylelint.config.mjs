import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve `importFrom` against this config's directory, not the CWD, so
// stylelint works both from the package dir and from the repo root (lefthook).
const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('stylelint').Config} */
export default {
  extends: ["@elmethis/core/stylelint"],
  rules: {
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: [
          path.join(dir, "node_modules/@elmethis/core/dist/tokens.css"),
          path.join(dir, "src/styles/_component-vars.css"),
        ],
      },
    ],
  },
  ignoreFiles: [
    "lib/**",
    "lib-types/**",
    "storybook-static/**",
    "node_modules/**",
    "./src/components/others/elm-color-primitive-sample.module.css",
    "./src/components/others/elm-color-semantic-sample.module.css",
  ],
};
