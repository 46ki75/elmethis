import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-css-modules"],
  plugins: ["stylelint-value-no-unknown-custom-properties"],
  rules: {
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: [
          path.join(dir, "node_modules/@elmethis/core/dist/tokens.css"),
        ],
      },
    ],
    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$",
      {
        message:
          "Expected class selector to be kebab-case with optional BEM '__element' and/or '--modifier' suffix",
      },
    ],
    "no-descending-specificity": null,
  },
  ignoreFiles: [
    "lib/**",
    "lib-solid/**",
    "lib-types/**",
    "storybook-static/**",
    "node_modules/**",
  ],
};
