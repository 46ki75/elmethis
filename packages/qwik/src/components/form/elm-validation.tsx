import { component$ } from "@builder.io/qwik";
import { mdiCheckCircle, mdiCheckCircleOutline } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-validation.module.scss";

export interface ElmValidationProps {
  text: string;
  validColor?: string;
  isValid: boolean;
}

export const ElmValidation = component$<ElmValidationProps>(
  ({ text, validColor = "#449763", isValid }) => {
    return (
      <div
        class={styles.validation}
        style={{
          "--opacity": isValid ? 1 : 0.5,
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
