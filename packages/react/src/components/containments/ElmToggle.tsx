import React, { useState } from "react";

import "@styles/global.css";
import styles from "./ElmToggle.module.css";

import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import { mdiChevronRight, mdiChevronUp, mdiPlus } from "@mdi/js";

export interface ElmToggleCSSVariables {
  "--margin-block"?: string;
}

export interface ElmToggleProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmToggleCSSVariables;

  /** The summary text of the toggle. */
  summary?: string;

  /** Custom inline summary content (used when summary is not provided). */
  summaryContent?: React.ReactNode;

  /** The margin-block of the toggle. */
  margin?: React.CSSProperties["marginBlock"];

  /** Whether the toggle is open. */
  value?: boolean;

  /** Called when the toggle open state changes. */
  onChange?: (value: boolean) => void;
}

export const ElmToggle = (props: ElmToggleProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = props.value !== undefined;
  const isOpen = isControlled ? props.value! : internalOpen;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const next = !isOpen;
    if (isControlled) {
      props.onChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  return (
    <div
      className={`${styles.toggle} ${isOpen ? styles.open : ""}`}
      style={
        {
          "--margin-block": props.margin,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.summary}
        onClick={handleClick}
        style={{
          borderRadius: isOpen ? "0.25rem 0.25rem 0rem 0rem" : "0.25rem",
        }}
      >
        <div className={styles["summary-left"]}>
          <span
            style={{
              transform: `rotate(${isOpen ? "90deg" : "0deg"})`,
              transition: "transform 200ms",
              display: "flex",
            }}
          >
            <ElmMdiIcon d={mdiChevronRight} color="#59b57c" size="1.25em" />
          </span>
          <div>
            {props.summary != null ? (
              <ElmInlineText>{props.summary}</ElmInlineText>
            ) : (
              props.summaryContent
            )}
          </div>
        </div>

        <span
          style={{
            transform: `rotate(${isOpen ? "135deg" : "0deg"})`,
            transition: "transform 200ms",
            display: "flex",
          }}
        >
          <ElmMdiIcon d={mdiPlus} color={isOpen ? "#b36472" : "#59b57c"} />
        </span>
      </div>

      <div
        className={`${styles.content} ${isOpen ? styles["content-open"] : ""}`}
      >
        {props.children}
      </div>

      {isOpen && (
        <div className={styles.close} onClick={handleClick}>
          <div className={styles["close-button"]}>
            <ElmMdiIcon d={mdiChevronUp} size="1.25em" color="#c56565" />
            <ElmInlineText color="#8e3636">CLOSE</ElmInlineText>
          </div>
        </div>
      )}
    </div>
  );
};
