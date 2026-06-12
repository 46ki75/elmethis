import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-callout.module.css";
import {
  mdiAlert,
  mdiAlertOctagram,
  mdiInformation,
  mdiLightbulbOn,
  mdiShieldAlert,
} from "@mdi/js";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const ICON_MAP: Record<AlertType, string> = Object.freeze({
  note: mdiInformation,
  tip: mdiLightbulbOn,
  important: mdiShieldAlert,
  warning: mdiAlert,
  caution: mdiAlertOctagram,
} as const);

export interface ElmCalloutProps extends ComponentPropsWithoutRef<"aside"> {
  /**
   * Type of alert
   */
  type?: AlertType;
}

export const ElmCallout = ({
  className,
  type = "note",
  style,
  children,
  ...props
}: ElmCalloutProps) => {
  return (
    <aside
      className={clsx(styles["elm-callout"], styles[type], className)}
      style={style}
      {...props}
    >
      <div className={styles.header}>
        <ElmMdiIcon className={styles.icon} d={ICON_MAP[type]} size="1.25rem" />
        <span>{type}</span>
      </div>

      <div className={styles.content}>{children}</div>
    </aside>
  );
};
