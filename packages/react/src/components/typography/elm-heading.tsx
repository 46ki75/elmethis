import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-heading.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

export interface ElmHeadingProps extends ComponentPropsWithoutRef<"h1"> {
  level: 1 | 2 | 3 | 4 | 5 | 6;

  text?: string;
}

const SIZE_MAP: Record<1 | 2 | 3 | 4 | 5 | 6, number> = Object.freeze({
  1: 1.5,
  2: 1.4,
  3: 1.3,
  4: 1.2,
  5: 1.15,
  6: 1.1,
} as const);

export const ElmHeading = ({
  className,
  level,
  text,
  id,
  style,
  children,
  ...props
}: ElmHeadingProps) => {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Tag
      className={clsx(
        styles["elm-heading"],
        textStyles.text,
        styles[`h${level}`],
        className,
      )}
      style={
        {
          "--elmethis-scoped-font-size": `${SIZE_MAP[level]}em`,
          ...style,
        } as CSSProperties
      }
      id={id}
      {...props}
    >
      <span>{text}</span>
      {children}
      {id && (
        <span style={{ padding: "0.5rem" }}>
          <ElmFragmentIdentifier id={id} />
        </span>
      )}

      {level === 2 && (
        <span className={styles["h2-underline"]} aria-hidden="true"></span>
      )}
    </Tag>
  );
};
