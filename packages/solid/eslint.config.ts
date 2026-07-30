import js from "@eslint/js";
import solid from "eslint-plugin-solid/configs/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { strictRules, typedTestRules } from "../../eslint.strict.ts";

export default defineConfig([
  globalIgnores([
    "lib",
    "lib-solid",
    "lib-types",
    "storybook-static",
    "node_modules",
    "vite.config.ts",
    "vitest.ssr.config.ts",
    "vitest.browser.config.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      // eslint-plugin-solid still publishes rule types for ESLint's legacy API.
      // @ts-expect-error -- the runtime flat config is compatible with ESLint 10.
      solid,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...strictRules,
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.spec.{ts,tsx}", "**/*.browser.spec.{ts,tsx}"],
    rules: typedTestRules,
  },
]);
