import React from "react";

// Styles
import "@styles/global.css";
import styles from "./ElmLanguageIcon.module.css";

// Icons
import RustIcon from "./language-icon/rust.svg?url";
import JavaScriptIcon from "./language-icon/javascript.svg?url";
import TypeScriptIcon from "./language-icon/typescript.svg?url";
import BashIcon from "./language-icon/bash.svg?url";
import TerraformIcon from "./language-icon/terraform.svg?url";
import HtmlIcon from "./language-icon/html.svg?url";
import CssIcon from "./language-icon/css.svg?url";
import NpmIcon from "./language-icon/npm.svg?url";
import JavaIcon from "./language-icon/java.svg?url";
import KotlinIcon from "./language-icon/kotlin.svg?url";
import GoIcon from "./language-icon/go.svg?url";
import PythonIcon from "./language-icon/python.svg?url";
import SqlIcon from "./language-icon/sql.svg?url";
import MdiJsonIcon from "./language-icon/mdi-json.svg?url";
import LuaIcon from "./language-icon/lua.svg?url";
import CSharpIcon from "./language-icon/csharp.svg?url";
import CppIcon from "./language-icon/cplusplus.svg?url";
import CIcon from "./language-icon/c.svg?url";

import MdiCodeIcon from "./language-icon/mdi-code.svg?url";

// Types
import type { Language } from "./language";

export interface ElmLanguageIconCSSVariables {}

export interface ElmLanguageIconProps {
  style?: React.CSSProperties & ElmLanguageIconCSSVariables;

  className?: string;

  /**
   * The size of the icon.
   */
  size?: number;

  /**
   * The language of the icon.
   */
  language: Language | string;
}

const LanguageIconMap: Record<Language, string> = {
  rust: RustIcon,
  javascript: JavaScriptIcon,
  typescript: TypeScriptIcon,
  shell: BashIcon,
  terraform: TerraformIcon,
  html: HtmlIcon,
  css: CssIcon,
  npm: NpmIcon,
  java: JavaIcon,
  kotlin: KotlinIcon,
  go: GoIcon,
  python: PythonIcon,
  sql: SqlIcon,
  json: MdiJsonIcon,
  lua: LuaIcon,
  csharp: CSharpIcon,
  cpp: CppIcon,
  c: CIcon,
  file: MdiCodeIcon,
};

export const ElmLanguageIcon = (props: ElmLanguageIconProps) => {
  return (
    <img
      className={[styles.icon, props.className].filter(Boolean).join(" ")}
      src={LanguageIconMap[props.language as Language] || MdiCodeIcon}
      width={props.size}
      height={props.size}
      alt={props.language}
      style={{
        width: props.size,
        height: props.size,
        ...props.style,
      }}
    />
  );
};
