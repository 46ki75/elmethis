import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-unsupported-block.module.css";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmUnsupportedBlockProps extends JSX.HTMLAttributes<HTMLDivElement> {
  details?: string;
}

export const ElmUnsupportedBlock = (props: ElmUnsupportedBlockProps) => {
  const rest = omit(props, "class", "children", "details");

  return (
    <div class={clsx(styles["elm-unsupported-block"], props.class)} {...rest}>
      <div class={styles.message}>
        <svg
          viewBox="0 0 24 24"
          width="1.25rem"
          height="1.25rem"
          class={styles.icon}
        >
          <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
        <ElmInlineText>UNSUPPORTED BLOCK</ElmInlineText>
      </div>
      {props.details && (
        <div class={styles.details}>
          <ElmInlineText>{props.details}</ElmInlineText>
        </div>
      )}
    </div>
  );
};
