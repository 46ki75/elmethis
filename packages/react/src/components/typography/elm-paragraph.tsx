import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-paragraph.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmParagraphProps extends ComponentPropsWithoutRef<"p"> {
  color?: string;

  backgroundColor?: string;
}

export const ElmParagraph = ({
  className,
  style,
  color,
  backgroundColor,
  children,
  ...props
}: ElmParagraphProps) => {
  return (
    <p
      className={clsx(styles["elm-paragraph"], textStyles.text, className)}
      style={
        {
          ...style,
          "--elmethis-scoped-color": color,
          "--elmethis-scoped-background-color": backgroundColor,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </p>
  );
};
