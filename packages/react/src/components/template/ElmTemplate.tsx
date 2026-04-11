import React from "react";

import styles from "./ElmTemplate.module.css";

export interface ElmTemplateProps {
  style?: React.CSSProperties;
}

export const ElmTemplate = (props: ElmTemplateProps) => {
  return (
    <div className={styles["elm-template"]} style={props.style}>
      PLACEHOLDER
    </div>
  );
};
