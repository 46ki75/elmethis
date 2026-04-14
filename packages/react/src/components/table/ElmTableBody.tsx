import React from "react";

import "@styles/global.css";

import { HasHeaderContext } from "./TableContext";

export interface ElmTableBodyProps extends React.PropsWithChildren {
  style?: React.CSSProperties;

  className?: string;
}

export const ElmTableBody = ({
  children,
  style,
  className,
}: ElmTableBodyProps) => {
  return (
    <HasHeaderContext.Provider value={false}>
      <tbody className={className} style={style}>
        {children}
      </tbody>
    </HasHeaderContext.Provider>
  );
};
