import React from "react";

import "@styles/global.css";
import styles from "./ElmSnackbarContainer.module.css";

import { ElmSnackbar } from "@components/containments/ElmSnackbar";

export interface SnackbarItem {
  id: string;
  label?: string;
  children?: React.ReactNode;
  timeout?: number;
  close: () => void;
}

export interface ElmSnackbarContainerCSSVariables {}

export interface ElmSnackbarContainerProps {
  style?: React.CSSProperties & ElmSnackbarContainerCSSVariables;

  /** List of snackbars to display. */
  snackbars: SnackbarItem[];
}

export const ElmSnackbarContainer = (props: ElmSnackbarContainerProps) => {
  return (
    <div className={styles["snackbar-screen"]} style={props.style}>
      <div className={styles["snackbar-container"]}>
        {props.snackbars.map((snackbar) => (
          <div key={snackbar.id} className={styles["snackbar-item"]}>
            <ElmSnackbar
              label={snackbar.label}
              timeout={snackbar.timeout}
              close={snackbar.close}
            >
              {snackbar.children}
            </ElmSnackbar>
          </div>
        ))}
      </div>
    </div>
  );
};
