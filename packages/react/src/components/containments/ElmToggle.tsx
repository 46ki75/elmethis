import React, { useState } from "react";

import "@styles/global.css";
import styles from "./ElmToggle.module.css";

import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { ElmInlineText } from "@components/typography/ElmInlineText";
import { mdiChevronRight, mdiPlus } from "@mdi/js";
import type { ElmethisCSSVariables } from "@styles/variables";
import clsx from "clsx";

export type ElmToggleCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmToggleProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmToggleCSSVariables;

  className?: string;

  /** The summary text of the toggle. */
  summary?: string;

  /** Custom inline summary content (used when summary is not provided). */
  summaryContent?: React.ReactNode;

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
      className={clsx(styles.toggle, props.className, {
        [styles.open]: isOpen,
      })}
      style={
        {
          ...props.style,
        } as React.CSSProperties
      }
    >
      <div className={styles.summary} onClick={handleClick}>
        <div className={styles["summary-left"]}>
          <ElmMdiIcon
            className={clsx(styles.chevron, { [styles.open]: isOpen })}
            d={mdiChevronRight}
            color="#59b57c"
            size="1rem"
          />
          <div>
            {props.summary != null ? (
              <ElmInlineText>{props.summary}</ElmInlineText>
            ) : (
              props.summaryContent
            )}
          </div>
        </div>

        <hr className={styles.divider} />

        <ElmMdiIcon
          className={clsx(styles.cross, { [styles.open]: isOpen })}
          d={mdiPlus}
          size="1rem"
          color={isOpen ? "#b36472" : "#59b57c"}
        />
      </div>

      <div className={styles.border}></div>

      <div
        className={clsx(styles.content, {
          [styles.close]: !isOpen,
        })}
      >
        {props.children}
      </div>
    </div>
  );
};
