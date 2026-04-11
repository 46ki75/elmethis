import React from "react";

import "@styles/global.css";
import styles from "./ElmStatusMessage.module.css";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

import {
  mdiReload,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiAlert,
} from "@mdi/js";

export type StatusType = "success" | "error" | "warning" | "pending";

const STATUS_MAP: Record<StatusType, { color: string; icon: string }> =
  Object.freeze({
    pending: { color: "#6987b8", icon: mdiReload },
    error: { color: "#c56565", icon: mdiAlertCircle },
    warning: { color: "#cdb57b", icon: mdiAlert },
    success: { color: "#59b57c", icon: mdiCheckCircle },
  } as const);

export interface ElmStatusMessageCSSVariables {}

export interface ElmStatusMessageProps {
  style?: React.CSSProperties & ElmStatusMessageCSSVariables;

  /**
   * The status type of the message.
   */
  status: StatusType;

  /**
   * The message to display.
   */
  message: string;
}

export const ElmStatusMessage = ({
  status,
  message,
  style,
}: ElmStatusMessageProps) => {
  const { color, icon } = STATUS_MAP[status];

  return (
    <div className={styles.wrapper} style={style}>
      <ElmMdiIcon d={icon} color={color} size="1em" />
      <ElmInlineText color={color}>{message}</ElmInlineText>
    </div>
  );
};
