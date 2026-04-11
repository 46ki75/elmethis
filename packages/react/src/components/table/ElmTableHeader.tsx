import React from "react";

import "@styles/global.css";
import styles from "./ElmTableHeader.module.css";

import { HasHeaderContext } from "./TableContext";

export interface ElmTableHeaderProps extends React.PropsWithChildren {
  style?: React.CSSProperties;
}

export const ElmTableHeader = ({ children, style }: ElmTableHeaderProps) => {
  return (
    <HasHeaderContext.Provider value={true}>
      <thead className={styles.thead} style={style}>
        {children}
      </thead>
    </HasHeaderContext.Provider>
  );
};
