import type { LanguageIcon } from "./types";

import { rust } from "./rust";
import { javascript } from "./javascript";
import { typescript } from "./typescript";
import { bash } from "./bash";
import { terraform } from "./terraform";
import { html } from "./html";
import { css } from "./css";
import { npm } from "./npm";
import { java } from "./java";
import { kotlin } from "./kotlin";
import { go } from "./go";
import { python } from "./python";
import { sql } from "./sql";
import { json } from "./json";
import { lua } from "./lua";
import { csharp } from "./c-sharp";
import { cplusplus } from "./c-plus-plus";
import { c } from "./c";

export type { LanguageIcon, SvgNode } from "./types";

/**
 * Canonical language keys. `"file"` is the generic fallback and has no glyph
 * here — consumers render it with their own code-tags icon.
 */
export const LANGUAGES = [
  "rust",
  "javascript",
  "typescript",
  "shell",
  "terraform",
  "html",
  "css",
  "npm",
  "java",
  "kotlin",
  "go",
  "python",
  "sql",
  "json",
  "lua",
  "csharp",
  "cpp",
  "c",
  "file",
] as const;

export type Language = (typeof LANGUAGES)[number];

/** Languages that have an authored glyph (every {@link Language} except `file`). */
export type GlyphLanguage = Exclude<Language, "file">;

/** Maps an arbitrary language hint (alias, extension) onto a {@link Language}. */
export const normalizeLanguage = (language: string): Language => {
  switch (language) {
    case "rust":
    case "rs":
      return "rust";

    case "javascript":
    case "js":
      return "javascript";

    case "typescript":
    case "ts":
      return "typescript";

    case "bash":
    case "sh":
    case "shell":
      return "shell";

    case "tf":
    case "terraform":
    case "hcl":
      return "terraform";

    case "html":
    case "html5":
      return "html";

    case "css":
    case "css3":
      return "css";

    case "npm":
      return "npm";

    case "java":
      return "java";

    case "kotlin":
    case "kt":
      return "kotlin";

    case "go":
    case "golang":
      return "go";

    case "python":
    case "py":
      return "python";

    case "sql":
      return "sql";

    case "json":
      return "json";

    case "lua":
      return "lua";

    case "cs":
    case "c#":
    case "csharp":
      return "csharp";

    case "cpp":
    case "c++":
      return "cpp";

    case "c":
    case "clang":
      return "c";

    default:
      return "file";
  }
};

/** The authored glyph artwork for every {@link GlyphLanguage}. */
export const languageIcons: Record<GlyphLanguage, LanguageIcon> = {
  rust,
  javascript,
  typescript,
  shell: bash,
  terraform,
  html,
  css,
  npm,
  java,
  kotlin,
  go,
  python,
  sql,
  json,
  lua,
  csharp,
  cpp: cplusplus,
  c,
};
