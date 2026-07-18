import { mergeProps, splitProps, type JSX } from "solid-js";
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

  if (typeof style !== "string") return { ...(style ?? {}), ...scopedStyle };

  return [
    style.trim().replace(/;$/, ""),
    `--elmethis-scoped-transition-timing-function:${String(transitionTimingFunction)}`,
  ]
    .filter(Boolean)
    .join(";");
};

export const ElmCollapse = (props: ElmCollapseProps) => {
  const merged = mergeProps(
    { direction: "row" as const, transitionTimingFunction: "ease-in-out" },
    props,
  );
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "children",
    "isOpen",
    "direction",
    "transitionTimingFunction",
  ]);

  return (
    <div
      {...rest}
      class={clsx(
        styles["elm-collapse"],
        local.isOpen && styles.open,
        local.direction === "row" && styles.row,
        local.direction === "column" && styles.column,
        local.direction === "both" && styles.both,
        local.class,
      )}
      style={mergeCollapseStyle(local.style, local.transitionTimingFunction)}
    >
      <div class={styles.inner}>{local.children}</div>
    </div>
  );
};
