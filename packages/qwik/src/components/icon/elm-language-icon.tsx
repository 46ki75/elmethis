import { Component, component$ } from "@builder.io/qwik";

// import styles from "./elm-language-icon.module.scss";

import { type CommonLanguageProps } from "./languages/language-interface";

import { Rust } from "./languages/rust";
import { Javascript } from "./languages/javascript";
import { Typescript } from "./languages/typescript";
import { Bash } from "./languages/bash";
import { Terraform } from "./languages/terraform";
import { Html } from "./languages/html";
import { Css } from "./languages/css";
import { Npm } from "./languages/npm";
import { Java } from "./languages/java";
import { Kotlin } from "./languages/kotlin";
import { Go } from "./languages/go";
import { Python } from "./languages/python";
import { Sql } from "./languages/sql";
import { Json } from "./languages/json";
import { Lua } from "./languages/lua";
import { Csharp } from "./languages/c-sharp";
import { Cplusplus } from "./languages/c-plus-plus";
import { C } from "./languages/c";

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

export interface ElmLanguageIconProps {
  /**
   * The size of the icon.
   */
  size?: number;

  /**
   * The language of the icon.
   */
  language: Language | string;
}

const normalizeLanguage = (language: string): Language => {
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

const renderMap: Record<Language, Component<CommonLanguageProps>> = {
  rust: Rust,
  javascript: Javascript,
  typescript: Typescript,
  shell: Bash,
  terraform: Terraform,
  html: Html,
  css: Css,
  npm: Npm,
  java: Java,
  kotlin: Kotlin,
  go: Go,
  python: Python,
  sql: Sql,
  json: Json,
  lua: Lua,
  csharp: Csharp,
  cpp: Cplusplus,
  c: C,
  file: () => null,
};

export const ElmLanguageIcon = component$<ElmLanguageIconProps>(
  ({ size = 24, language }) => {
    const Component = renderMap[normalizeLanguage(language)];

    return <Component size={size} />;
  },
);
