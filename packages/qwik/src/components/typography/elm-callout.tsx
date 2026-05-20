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
    note: { code: "#6987b8", icon: mdiInformation },
    tip: { code: "#59b57c", icon: mdiLightbulbOn },
    important: { code: "#9771bd", icon: mdiShieldAlert },
    warning: { code: "#b8a36e", icon: mdiAlert },
    caution: { code: "#b36472", icon: mdiAlertOctagram },
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
