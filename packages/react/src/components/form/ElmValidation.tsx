import React from "react";

import "@styles/global.css";
import styles from "./ElmValidation.module.css";

import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import { mdiCheckCircle, mdiCheckCircleOutline } from "@mdi/js";

export interface ElmValidationCSSVariables {
  "--opacity"?: number;
}

export interface ElmValidationProps {
  style?: React.CSSProperties & ElmValidationCSSVariables;

  /** The validation message text. */
  text: string;

  /** The color when valid. */
  validColor?: string;

  /** Whether the validation is satisfied. */
  isValid: boolean;
}

export const ElmValidation = ({
  validColor = "#449763",
  ...props
}: ElmValidationProps) => {
  return (
    <div
      className={styles.validation}
      style={
        {
          "--opacity": props.isValid ? 1 : 0.5,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <ElmMdiIcon
        d={props.isValid ? mdiCheckCircle : mdiCheckCircleOutline}
        color={props.isValid ? validColor : undefined}
      />
      <span style={{ color: props.isValid ? validColor : undefined }}>
        {props.text}
      </span>
    </div>
  );
};
