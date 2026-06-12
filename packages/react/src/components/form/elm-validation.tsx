import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";
import { mdiCheckCircle, mdiCheckCircleOutline } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-validation.module.css";

export interface ElmValidationProps extends ComponentPropsWithoutRef<"div"> {
  text: string;
  validColor?: string;
  isValid: boolean;
}

export const ElmValidation = ({
  className,
  style,
  text,
  validColor = "var(--elmethis-color-accent-success)",
  isValid,
  ...props
}: ElmValidationProps) => {
  return (
    <div
      className={clsx(styles["elm-validation"], className)}
      style={
        {
          "--elmethis-scoped-opacity": isValid ? 1 : 0.5,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <ElmMdiIcon
        d={isValid ? mdiCheckCircle : mdiCheckCircleOutline}
        color={isValid ? validColor : undefined}
      />
      <ElmInlineText color={isValid ? validColor : undefined}>
        {text}
      </ElmInlineText>
    </div>
  );
};
