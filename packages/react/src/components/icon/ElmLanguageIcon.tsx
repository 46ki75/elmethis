import React from "react";

// Styles
import "@styles/global.css";
import styles from "./ElmLanguageIcon.module.css";

// Icons
import { addCollection, Icon } from "@iconify/react";
import { icons as devIcons } from "@iconify-json/devicon";
import { icons as mdiIcons } from "@iconify-json/mdi";

// Types
import type { Language } from "./language";

addCollection(devIcons);
addCollection(mdiIcons);

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
  rust: "devicon:rust",
  javascript: "devicon:javascript",
  typescript: "devicon:typescript",
  shell: "devicon:bash",
  terraform: "devicon:terraform",
  html: "devicon:html5",
  css: "devicon:css",
  npm: "devicon:npm",
  java: "devicon:java",
  kotlin: "devicon:kotlin",
  go: "devicon:go",
  python: "devicon:python",
  sql: "devicon:mysql",
  json: "mdi:code-json",
  lua: "devicon:lua",
  csharp: "devicon:csharp",
  cpp: "devicon:cplusplus",
  c: "devicon:c",
  file: "mdi:code",
};

export const ElmLanguageIcon = (props: ElmLanguageIconProps) => {
  return (
    <div className={styles["elm-language-icon"]} style={props.style}>
      <Icon
        icon={LanguageIconMap[props.language as Language] || "mdi:code"}
        width={props.size}
        height={props.size}
        color="gray"
      />
    </div>
  );
};
