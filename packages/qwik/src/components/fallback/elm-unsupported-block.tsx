import { component$ } from "@builder.io/qwik";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-unsupported-block.module.scss";

export interface ElmUnsupportedBlockProps {
  details?: string;
}

export const ElmUnsupportedBlock = component$<ElmUnsupportedBlockProps>(
  (props) => {
    return (
      <div class={styles.unsupported}>
        <div class={styles.message}>
          <svg
            viewBox="0 0 24 24"
            width="1.25rem"
            height="1.25rem"
            class={styles.icon}
          >
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <ElmInlineText text="UNSUPPORTED BLOCK" color="#868e9c" />
        </div>
        {props.details && (
          <div class={styles.details}>
            <ElmInlineText text={props.details} color="#868e9c" />
          </div>
        )}
      </div>
    );
  },
);
