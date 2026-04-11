import React from "react";

import "@styles/global.css";

import { HasHeaderContext } from "./TableContext";

export interface ElmTableBodyProps extends React.PropsWithChildren {
  style?: React.CSSProperties;
}

export const ElmTableBody = ({ children, style }: ElmTableBodyProps) => {
  return (
    <HasHeaderContext.Provider value={false}>
      <tbody style={style}>{children}</tbody>
    </HasHeaderContext.Provider>
  );
};
