import { mergeProps, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import { mergeStyle } from "../../styles/merge-style";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-validation.module.css";

export interface ElmValidationProps extends JSX.HTMLAttributes<HTMLDivElement> {
  text: string;
  validColor?: string;
  isValid: boolean;
}

const CHECK_CIRCLE_PATH =
  "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z";
const CHECK_CIRCLE_OUTLINE_PATH =
  "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z";

export const ElmValidation = (props: ElmValidationProps) => {
  const merged = mergeProps(
    { validColor: "var(--elmethis-color-accent-success)" },
    props,
  );
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "text",
    "validColor",
    "isValid",
  ]);
  return (
    <div
      {...rest}
      class={clsx(styles["elm-validation"], local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-opacity": local.isValid ? 1 : 0.5,
      })}
    >
      <ElmMdiIcon
        d={local.isValid ? CHECK_CIRCLE_PATH : CHECK_CIRCLE_OUTLINE_PATH}
        color={local.isValid ? local.validColor : undefined}
      />
      <ElmInlineText color={local.isValid ? local.validColor : undefined}>
        {local.text}
      </ElmInlineText>
    </div>
  );
};
