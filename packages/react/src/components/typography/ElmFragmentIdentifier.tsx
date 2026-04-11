import React, { useCallback } from "react";

import "@styles/global.css";
import styles from "./ElmFragmentIdentifier.module.css";

export interface ElmFragmentIdentifierCSSVariables {}

export interface ElmFragmentIdentifierProps {
  style?: React.CSSProperties & ElmFragmentIdentifierCSSVariables;

  /**
   * ID of the heading element.
   */
  id: string;
}

export const ElmFragmentIdentifier = (props: ElmFragmentIdentifierProps) => {
  const handleHashClick = useCallback(
    (id: string) => {
      const url = new URL(window.location.href);
      url.hash = id;
      window.history.replaceState(null, "", url.toString());

      const target = document.getElementById(id);
      if (target != null) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    [],
  );

  return (
    <span
      className={styles.fragment}
      style={props.style}
      onClick={() => handleHashClick(props.id)}
    >
      #
    </span>
  );
};
