import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-list.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmListProps extends Omit<
  ComponentPropsWithoutRef<"ul">,
  "type"
> {
  listStyle?: "unordered" | "ordered";
  type?: "a" | "i" | "1" | "A" | "I";
}

export const ElmList = ({
  className,
  listStyle = "unordered",
  children,
  ...props
}: ElmListProps) => {
  if (listStyle === "ordered") {
    return (
      <ol
        className={clsx(
          textStyles.text,
          styles["elm-list"],
          styles.numbered,
          className,
        )}
        {...props}
      >
        {children}
      </ol>
    );
  }

  return (
    <ul
      className={clsx(
        textStyles.text,
        styles["elm-list"],
        styles.bulleted,
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
};
