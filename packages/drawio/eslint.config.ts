/// <reference types="node" />

import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { strictLinterOptions, strictRules } from "../../eslint.strict.ts";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.ts"],
    linterOptions: strictLinterOptions,
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: strictRules,
  },
  {
    files: ["eslint.config.ts"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: "../../tsconfig.eslint.json",
        tsconfigRootDir,
      },
    },
  },
]);
