import { defineComponent, type HTMLAttributes, type PropType } from "vue";
import { clsx } from "clsx";
import {
  mdiAlert,
  mdiAlertOctagram,
  mdiInformation,
  mdiLightbulbOn,
  mdiShieldAlert,
} from "@mdi/js";

import styles from "./elm-callout.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const ICON_MAP: Record<AlertType, string> = Object.freeze({
  note: mdiInformation,
  tip: mdiLightbulbOn,
  important: mdiShieldAlert,
  warning: mdiAlert,
  caution: mdiAlertOctagram,
} as const);

export interface ElmCalloutProps extends HTMLAttributes {
  /**
   * Type of alert
   */
  type?: AlertType;
}

export const ElmCallout = defineComponent({
  name: "ElmCallout",
  props: {
    type: { type: String as PropType<AlertType>, default: "note" },
  },
  setup(props, { slots }) {
    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <aside class={clsx(styles["elm-callout"], styles[props.type])}>
        <div class={styles.header}>
          <ElmMdiIcon
            class={styles.icon}
            d={ICON_MAP[props.type]}
            size="1.25rem"
          />
          <span>{props.type}</span>
        </div>

        <div class={styles.content}>{slots.default?.()}</div>
      </aside>
    );
  },
});
