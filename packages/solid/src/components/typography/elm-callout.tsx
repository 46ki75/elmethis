import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-callout.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const ICON_MAP: Record<AlertType, string> = Object.freeze({
  note: "M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  tip: "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z",
  important:
    "M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5M11,7H13V13H11M11,15H13V17H11",
  warning: "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",
  caution:
    "M2.2,16.06L3.88,12L2.2,7.94L6.26,6.26L7.94,2.2L12,3.88L16.06,2.2L17.74,6.26L21.8,7.94L20.12,12L21.8,16.06L17.74,17.74L16.06,21.8L12,20.12L7.94,21.8L6.26,17.74L2.2,16.06M13,17V15H11V17H13M13,13V7H11V13H13Z",
} as const);

export interface ElmCalloutProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Type of alert. */
  type?: AlertType;
}

export const ElmCallout = (props: ElmCalloutProps) => {
  const merged = mergeProps({ type: "note" as const }, props);
  const [local, rest] = splitProps(merged, ["class", "children", "type"]);

  return (
    <aside
      {...rest}
      class={clsx(styles["elm-callout"], styles[local.type], local.class)}
    >
      <div class={styles.header}>
        <ElmMdiIcon
          class={styles.icon}
          d={ICON_MAP[local.type]}
          size="1.25rem"
        />
        <span>{local.type}</span>
      </div>

      <div class={styles.content}>{local.children}</div>
    </aside>
  );
};
