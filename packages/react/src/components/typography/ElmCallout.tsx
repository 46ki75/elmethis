import React, { useEffect, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmCallout.module.css";
import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";

import {
  mdiInformation,
  mdiLightbulbOn,
  mdiShieldAlert,
  mdiAlert,
  mdiAlertOctagram,
} from "@mdi/js";

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

const COLOR_MAP: Record<AlertType, { code: string; icon: string }> =
  Object.freeze({
    note: { code: "#6987b8", icon: mdiInformation },
    tip: { code: "#59b57c", icon: mdiLightbulbOn },
    important: { code: "#9771bd", icon: mdiShieldAlert },
    warning: { code: "#b8a36e", icon: mdiAlert },
    caution: { code: "#b36472", icon: mdiAlertOctagram },
  } as const);

export interface ElmCalloutCSSVariables {}

export interface ElmCalloutProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmCalloutCSSVariables;

  /**
   * Type of alert
   */
  type?: AlertType;
}

export const ElmCallout = ({ type = "note", ...props }: ElmCalloutProps) => {
  const targetRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const color = COLOR_MAP[type];

  return (
    <aside
      ref={targetRef}
      className={styles.callout}
      style={
        {
          "--border-color": color.code,
          "--bg-color": `color-mix(in srgb, ${color.code} 10%, transparent)`,
          "--scale": isVisible ? 1 : 0,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <div className={styles.header}>
        <ElmMdiIcon d={color.icon} size="1.25em" color={color.code} />
        <ElmInlineText color={color.code}>{type.toUpperCase()}</ElmInlineText>
      </div>
      <div>{props.children}</div>
    </aside>
  );
};
