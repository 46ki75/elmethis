import React from "react";

import "@styles/global.css";
import styles from "./ElmSnackbar.module.css";

import { ElmInlineText } from "@components/typography/ElmInlineText";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { mdiCloseCircleOutline } from "@mdi/js";

export interface ElmSnackbarCSSVariables {}

export interface ElmSnackbarProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmSnackbarCSSVariables;

  className?: string;

  /** Text label for the snackbar. */
  label?: string;

  /** Timeout in milliseconds before auto-dismiss animation ends. */
  timeout?: number;

  /** Called to close/dismiss the snackbar. */
  close: () => void;
}

export const ElmSnackbar = ({ timeout = 5000, ...props }: ElmSnackbarProps) => {
  return (
    <div
      className={[styles.snackbar, props.className].filter(Boolean).join(" ")}
      style={props.style}
    >
      {props.label != null ? (
        <ElmInlineText>{props.label}</ElmInlineText>
      ) : (
        props.children
      )}

      <div className={styles.icon} onClick={props.close}>
        <ElmMdiIcon d={mdiCloseCircleOutline} size="1em" />
      </div>

      <div
        className={styles.progress}
        style={{ animationDuration: `${timeout}ms` }}
      ></div>
    </div>
  );
};
