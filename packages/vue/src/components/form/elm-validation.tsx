import { defineComponent, type CSSProperties, type HTMLAttributes } from "vue";
import { clsx } from "clsx";
import { mdiCheckCircle, mdiCheckCircleOutline } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-validation.module.css";

export interface ElmValidationProps extends HTMLAttributes {
  text: string;
  validColor?: string;
  isValid: boolean;
}

export const ElmValidation = defineComponent({
  name: "ElmValidation",
  props: {
    text: { type: String, required: true },
    validColor: {
      type: String,
      default: "var(--elmethis-color-accent-success)",
    },
    isValid: { type: Boolean, required: true },
  },
  setup(props) {
    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => (
      <div
        class={clsx(styles["elm-validation"])}
        style={
          {
            "--elmethis-scoped-opacity": props.isValid ? 1 : 0.5,
          } as CSSProperties
        }
      >
        <ElmMdiIcon
          d={props.isValid ? mdiCheckCircle : mdiCheckCircleOutline}
          color={props.isValid ? props.validColor : undefined}
        />
        <ElmInlineText color={props.isValid ? props.validColor : undefined}>
          {props.text}
        </ElmInlineText>
      </div>
    );
  },
});
