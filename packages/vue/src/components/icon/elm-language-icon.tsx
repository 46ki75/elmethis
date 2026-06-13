import { defineComponent, h, type Component, type PropType } from "vue";
import { mdiCodeTags } from "@mdi/js";

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
import { ElmMdiIcon } from "./elm-mdi-icon";

// The canonical language list (also the source of the `Language` union and the
// Storybook radio control). qwik keeps the list co-located in the same module.
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

// `file` is the fallback: an ElmMdiIcon with the code-tags glyph on the 24-grid
// viewBox — the discriminator between "known language" and "fallback".
const FileIcon = defineComponent({
  name: "FileIcon",
  props: {
    size: { type: [Number, String] as PropType<number | string>, default: 24 },
  },
  setup(props) {
    return () => <ElmMdiIcon d={mdiCodeTags} size={String(props.size)} />;
  },
});

const renderMap: Record<Language, Component> = {
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
  file: FileIcon,
};

export const ElmLanguageIcon = defineComponent({
  name: "ElmLanguageIcon",
  props: {
    size: { type: Number, default: 24 },
    language: { type: String, required: true },
  },
  setup(props) {
    // inheritAttrs default: passthrough class/style merge onto the resolved
    // sub-icon's root svg.
    return () => {
      const Comp = renderMap[normalizeLanguage(props.language)];
      return h(Comp, { size: props.size });
    };
  },
});
