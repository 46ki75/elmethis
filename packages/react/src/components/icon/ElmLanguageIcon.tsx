import React from "react";

// Styles
import "@styles/global.css";
import styles from "./ElmLanguageIcon.module.css";

// Icons
import RustIcon from "./language-icon/rust.svg?url";
import JavaScriptIcon from "./language-icon/javascript.svg?url";
import TypeScriptIcon from "./language-icon/typescript.svg?url";

import MdiCodeIcon from "./language-icon/mdi-code.svg?url";

// Types
import type { Language } from "./language";

export interface ElmLanguageIconProps {
  style?: React.CSSProperties & {
    "--elmethis-size"?: number;
  };

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
  // shell: "devicon:bash",
  // terraform: "devicon:terraform",
  // html: "devicon:html5",
  // css: "devicon:css",
  // npm: "devicon:npm",
  // java: "devicon:java",
  // kotlin: "devicon:kotlin",
  // go: "devicon:go",
  // python: "devicon:python",
  // sql: "devicon:mysql",
  // json: "mdi:code-json",
  // lua: "devicon:lua",
  // csharp: "devicon:csharp",
  // cpp: "devicon:cplusplus",
  // c: "devicon:c",
  file: MdiCodeIcon,
};

export const ElmLanguageIcon = (props: ElmLanguageIconProps) => {
  return (
    <img
      className={styles.icon}
      src={LanguageIconMap[props.language as Language] || MdiCodeIcon}
      width={props.size}
      height={props.size}
      alt={props.language}
      style={{
        "--elmethis-size": props.size,
        ...props.style,
      }}
    />
  );
};
