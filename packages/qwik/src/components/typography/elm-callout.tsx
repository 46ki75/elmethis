import { component$, PropsOf, Slot, type CSSProperties } from "@qwik.dev/core";

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

const COLOR_MAP: Record<AlertType, { code: string; icon: string }> =
  Object.freeze({
    note: { code: "var(--elmethis-accent-info)", icon: mdiInformation },
    tip: { code: "var(--elmethis-accent-success)", icon: mdiLightbulbOn },
    important: {
      code: "var(--elmethis-accent-important)",
      icon: mdiShieldAlert,
    },
    warning: { code: "var(--elmethis-accent-warning)", icon: mdiAlert },
    caution: { code: "var(--elmethis-accent-error)", icon: mdiAlertOctagram },
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
        class={[styles.callout, className]}
        style={
          {
            "--elmethis-scoped-callout-color": COLOR_MAP[type].code,
            ...(style as CSSProperties),
          } as CSSProperties
        }
        {...props}
      >
        <div class={styles.header}>
          <ElmMdiIcon
            d={COLOR_MAP[type].icon}
            color={COLOR_MAP[type].code}
            size="1.25rem"
          />
          <ElmInlineText>{type.toLocaleUpperCase()}</ElmInlineText>
        </div>

        <div class={styles.content}>
          <Slot />
        </div>
      </aside>
    );
  },
);
