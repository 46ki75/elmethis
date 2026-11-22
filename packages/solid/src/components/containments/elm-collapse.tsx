import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import styles from "./elm-collapse.module.css";

export interface ElmCollapseProps extends JSX.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;

  direction?: "row" | "column" | "both";

  transitionTimingFunction?: JSX.CSSProperties["transition-timing-function"];
}

const mergeCollapseStyle = (
  style: ElmCollapseProps["style"],
  transitionTimingFunction: ElmCollapseProps["transitionTimingFunction"],
): JSX.CSSProperties | string => {
  const scopedStyle = {
    "--elmethis-scoped-transition-timing-function": transitionTimingFunction,
  } satisfies JSX.CSSProperties;

  if (typeof style !== "string") {
    return { ...(style ?? {}), ...scopedStyle };
  }

  return [
    style.trim().replace(/;$/, ""),
    `--elmethis-scoped-transition-timing-function:${String(transitionTimingFunction)}`,
  ]
    .filter(Boolean)
    .join(";");
};

export const ElmCollapse = (props: ElmCollapseProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "children",
    "isOpen",
    "direction",
    "transitionTimingFunction",
  );
  const direction = () => props.direction ?? "row";

  return (
    <div
      {...rest}
      class={clsx(
        styles["elm-collapse"],
        props.isOpen && styles.open,
        direction() === "row" && styles.row,
        direction() === "column" && styles.column,
        direction() === "both" && styles.both,
        props.class,
      )}
      style={mergeCollapseStyle(
        props.style,
        props.transitionTimingFunction ?? "ease-in-out",
      )}
    >
      <div class={styles.inner}>{props.children}</div>
    </div>
  );
};
