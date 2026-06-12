import type { ComponentPropsWithoutRef } from "react";
import { useMemo } from "react";
import { clsx } from "clsx";

import styles from "./elm-table.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";
import { HasRowHeaderContext } from "./table-context";

export interface ElmTableProps extends ComponentPropsWithoutRef<"table"> {
  caption?: string;

  hasRowHeader?: boolean;
}

export const ElmTable = ({
  className,
  caption,
  hasRowHeader = false,
  children,
  ...rest
}: ElmTableProps) => {
  const hasRowHeaderValue = useMemo(
    () => ({ value: hasRowHeader }),
    [hasRowHeader],
  );

  return (
    <HasRowHeaderContext.Provider value={hasRowHeaderValue}>
      <table
        className={clsx(styles["elm-table"], textStyles.text, className)}
        {...rest}
      >
        {caption && (
          <caption>
            <span className={styles.caption}>
              <span className={styles.spacing}></span>

              <span className={styles["caption-inner"]}>
                <ElmInlineText>{caption}</ElmInlineText>
              </span>

              <span className={styles.spacing}></span>
            </span>
          </caption>
        )}
        {children}
      </table>
    </HasRowHeaderContext.Provider>
  );
};
