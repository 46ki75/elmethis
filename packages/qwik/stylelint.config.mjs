/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-css-modules"],
  rules: {
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
    "lib-types/**",
    "storybook-static/**",
    "node_modules/**",
  ],
};
