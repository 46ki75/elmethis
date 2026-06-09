import { component$, PropsOf, Slot } from "@qwik.dev/core";

import styles from "./elm-callout.module.css";
import {
  mdiAlert,
  mdiAlertOctagram,
  mdiInformation,
  mdiLightbulbOn,
  mdiShieldAlert,
} from "@mdi/js";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "./elm-inline-text";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const ICON_MAP: Record<AlertType, string> = Object.freeze({
  note: mdiInformation,
  tip: mdiLightbulbOn,
  important: mdiShieldAlert,
  warning: mdiAlert,
  caution: mdiAlertOctagram,
} as const);

export interface ElmCalloutProps extends PropsOf<"aside"> {
  /**
   * Type of alert
   */
  type?: AlertType;
}

export const ElmCallout = component$<ElmCalloutProps>(
  ({ class: className, type = "note", style, ...props }) => {
    return (
      <aside
        class={[styles.callout, styles[type], className]}
        style={style}
        {...props}
      >
        <div class={styles.header}>
          <ElmMdiIcon class={styles.icon} d={ICON_MAP[type]} size="1.25rem" />
          <ElmInlineText>{type}</ElmInlineText>
        </div>

        <div class={styles.content}>
          <Slot />
        </div>
      </aside>
    );
  },
);
