import React from "react";

import "@styles/global.css";
import styles from "./ElmLanguageIcon.module.css";

export interface ElmLanguageIconProps {
  style?: React.CSSProperties;
}

export const ElmLanguageIcon = (props: ElmLanguageIconProps) => {
  return (
    <div className={styles["elm-language-icon"]} style={props.style}>
      PLACEHOLDER
    </div>
  );
};
