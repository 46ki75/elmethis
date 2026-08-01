/// <reference types="node" />

import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import {
  strictLinterOptions,
  strictRules,
  typedTestRules,
} from "../../eslint.strict.ts";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    linterOptions: strictLinterOptions,
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
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
  {
    files: ["eslint.config.ts"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: false,
        project: "../../tsconfig.eslint.json",
        tsconfigRootDir,
      },
    },
  },
]);
