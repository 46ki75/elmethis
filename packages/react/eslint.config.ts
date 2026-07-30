import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import {
  strictLinterOptions,
  strictRules,
  typedTestRules,
} from "../../eslint.strict.ts";

export default defineConfig([
  globalIgnores([
    "dist",
    "lib",
    "lib-types",
    "storybook-static",
    "node_modules",
    "vite.config.ts",
    "vitest.browser.config.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    linterOptions: strictLinterOptions,
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
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
    extends: [vitest.configs.recommended],
    rules: typedTestRules,
  },
]);
