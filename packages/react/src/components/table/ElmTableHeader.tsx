import React from "react";

import "@styles/global.css";
import styles from "./ElmTableHeader.module.css";

import { HasHeaderContext } from "./TableContext";

export interface ElmTableHeaderProps extends React.PropsWithChildren {
  style?: React.CSSProperties;

  className?: string;
}

export const ElmTableHeader = ({
  children,
  style,
  className,
}: ElmTableHeaderProps) => {
  return (
    <HasHeaderContext.Provider value={true}>
      <thead
        className={[styles.thead, className].filter(Boolean).join(" ")}
        style={style}
      >
        {children}
      </thead>
    </HasHeaderContext.Provider>
  );
};
