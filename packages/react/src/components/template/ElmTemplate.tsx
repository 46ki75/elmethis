import React from "react";

import "@styles/global.css";
import styles from "./ElmTemplate.module.css";

export interface ElmTemplateCSSVariables {}

export interface ElmTemplateProps {
  style?: React.CSSProperties & ElmTemplateCSSVariables;

  className?: string;
}

export const ElmTemplate = (props: ElmTemplateProps) => {
  return (
    <div
      className={[styles["elm-template"], props.className]
        .filter(Boolean)
        .join(" ")}
      style={props.style}
    >
      PLACEHOLDER
    </div>
  );
};
