import { component$, type CSSProperties } from "@builder.io/qwik";
import { mdiCheckCircle, mdiCheckCircleOutline } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-validation.module.css";

export interface ElmValidationProps {
  class?: string;

  style?: CSSProperties;

  text: string;
  validColor?: string;
  isValid: boolean;
}

export const ElmValidation = component$<ElmValidationProps>(
  ({ class: className, style, text, validColor = "#449763", isValid }) => {
    return (
      <div
        class={[styles.validation, className]}
        style={{
          "--opacity": isValid ? 1 : 0.5,
          ...style,
        }}
      >
        <ElmMdiIcon
          d={isValid ? mdiCheckCircle : mdiCheckCircleOutline}
          color={isValid ? validColor : undefined}
        />
        <ElmInlineText text={text} color={isValid ? validColor : undefined} />
      </div>
    );
  },
);
