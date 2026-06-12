import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-unsupported-block.module.css";

export interface ElmUnsupportedBlockProps extends ComponentPropsWithoutRef<"div"> {
  details?: string;
}

export const ElmUnsupportedBlock = ({
  className,
  details,
  ...props
}: ElmUnsupportedBlockProps) => {
  return (
    <div
      className={clsx(styles["elm-unsupported-block"], className)}
      {...props}
    >
      <div className={styles.message}>
        <svg
          viewBox="0 0 24 24"
          width="1.25rem"
          height="1.25rem"
          className={styles.icon}
        >
          <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
        <ElmInlineText>UNSUPPORTED BLOCK</ElmInlineText>
      </div>
      {details && (
        <div className={styles.details}>
          <ElmInlineText>{details}</ElmInlineText>
        </div>
      )}
    </div>
  );
};
