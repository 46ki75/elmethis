import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-css-modules"],
  plugins: ["stylelint-value-no-unknown-custom-properties"],
  rules: {
    "color-no-hex": [
      true,
      {
        message: "Use an Elmethis color token instead of a hex color",
        severity: "error",
      },
    ],
    "color-named": [
      "never",
      {
        message: "Use an Elmethis color token instead of a named color",
        severity: "error",
      },
    ],
    "declaration-property-value-disallowed-list": [
      {
        "/.*/": [
          "/(?<![-\\w])(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\\((?!\\s*from\\b)/i",
        ],
      },
      {
        message: "Use an Elmethis color token instead of a color function",
        severity: "error",
      },
    ],
    "declaration-property-value-allowed-list": [
      {
        "box-shadow": [
          "var(--elmethis-box-shadow-small)",
          "var(--elmethis-box-shadow-medium)",
          "var(--elmethis-box-shadow-large)",
          "none",
        ],
      },
      {
        message: "Use an Elmethis box-shadow token",
        severity: "error",
      },
    ],
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: [
          path.join(dir, "node_modules/@elmethis/core/dist/tokens.css"),
          path.join(dir, "src/styles/_component-vars.css"),
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
    "./src/components/others/elm-color-primitive-sample.module.css",
    "./src/components/others/elm-color-semantic-sample.module.css",
  ],
};
