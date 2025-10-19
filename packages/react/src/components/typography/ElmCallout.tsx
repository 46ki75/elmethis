import {
  mdiInformation,
  mdiLightbulbOn,
  mdiShieldAlert,
  mdiAlert,
  mdiAlertOctagram,
} from "@mdi/js";
import { ElmMdiIcon } from "../icon/ElmMdiIcon";
import { type ComponentProps, type CSSProperties } from "react";
import style from "./ElmCallout.module.scss";
import { ElmInlineText } from "./ElmInlineText";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const colors: Record<AlertType, { code: string; icon: string }> = {
  note: { code: "#6987b8", icon: mdiInformation },
  tip: { code: "#59b57c", icon: mdiLightbulbOn },
  important: { code: "#9771bd", icon: mdiShieldAlert },
  warning: { code: "#b8a36e", icon: mdiAlert },
  caution: { code: "#b36472", icon: mdiAlertOctagram },
};

export interface ElmCalloutProps extends ComponentProps<"aside"> {
  /**
   * Type of alert
   */
  type?: AlertType;
}

export const ElmCallout = ({ type = "note", children }: ElmCalloutProps) => {
  return (
    <aside
      className={style.callout}
      style={
        {
          "--callout-color": colors[type].code,
        } as CSSProperties
      }
    >
      <div className={style.header}>
        <ElmMdiIcon d={colors[type].icon} color={colors[type].code} />
        <ElmInlineText text={type.toUpperCase()} color={colors[type].code} />
      </div>
      {children}
    </aside>
  );
};
