import React, { useCallback, useId, useRef, useState } from "react";

import "@styles/global.css";
import styles from "./ElmTextField.module.css";

import { ElmMdiIcon } from "@components/icon/ElmMdiIcon";
import {
  mdiEyeOutline,
  mdiEyeOffOutline,
  mdiBackspaceOutline,
  mdiText,
  mdiPen,
  mdiEmail,
  mdiAccount,
  mdiLock,
  mdiKey,
  mdiEarth,
  mdiTag,
  mdiArchive,
  mdiLinkVariant,
  mdiMagnify,
} from "@mdi/js";

export type ElmTextFieldIcon =
  | "text"
  | "pen"
  | "email"
  | "user"
  | "lock"
  | "key"
  | "earth"
  | "tag"
  | "archive"
  | "link"
  | "search";

const iconMap: Record<ElmTextFieldIcon, string> = {
  text: mdiText,
  pen: mdiPen,
  email: mdiEmail,
  user: mdiAccount,
  lock: mdiLock,
  key: mdiKey,
  earth: mdiEarth,
  tag: mdiTag,
  archive: mdiArchive,
  link: mdiLinkVariant,
  search: mdiMagnify,
};

export interface ElmTextFieldCSSVariables {
  "--highlight-color"?: string;
}

export interface ElmTextFieldProps {
  style?: React.CSSProperties & ElmTextFieldCSSVariables;

  className?: string;

  /** Label for the text field. */
  label: string;

  /** Maximum character length. */
  maxLength?: number;

  /** Suffix text. */
  suffix?: string;

  /** Placeholder text. */
  placeholder?: string;

  /** Whether the text field is disabled. */
  disabled?: boolean;

  /** Whether the text field is in loading state. */
  loading?: boolean;

  /** Icon to display on the left. */
  icon?: ElmTextFieldIcon;

  /** Whether the text field is a password field. */
  isPassword?: boolean;

  /** Whether the field is required. */
  required?: boolean;

  /** Current value. */
  value?: string;

  /** Called when the value changes. */
  onChange?: (value: string) => void;
}

export const ElmTextField = ({
  disabled = false,
  loading = false,
  isPassword = false,
  required = false,
  value = "",
  ...props
}: ElmTextFieldProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [type, setType] = useState(isPassword ? "password" : "text");

  const { onChange } = props;

  const handleDelete = useCallback(() => {
    if (!loading && !disabled && onChange) {
      onChange("");
    }
  }, [loading, disabled, onChange]);

  const handleVisibleSwitch = useCallback(() => {
    if (!loading && !disabled) {
      setType((prev) => (prev === "text" ? "password" : "text"));
    }
  }, [loading, disabled]);

  const handleKeyDown = useCallback(
    (action: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    },
    [],
  );

  const wrapperClass = [
    styles.wrapper,
    isFocused ? styles.active : "",
    props.className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={wrapperClass}
      style={
        {
          backgroundColor: disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
          "--highlight-color": isFocused ? "#bfa056" : undefined,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          <span>{props.label}</span>
          {required && <span className={styles.required}>*</span>}
        </label>
        {props.maxLength != null && (
          <span
            className={[
              styles.counter,
              value.length > props.maxLength ? styles["counter-over"] : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {value.length} / {props.maxLength}
          </span>
        )}
      </div>
      <div className={styles.body}>
        {props.icon && (
          <ElmMdiIcon d={iconMap[props.icon]} size="1.5rem" color="gray" />
        )}

        <input
          id={id}
          ref={inputRef}
          type={type}
          className={styles.input}
          placeholder={props.placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || loading}
          style={{
            cursor: disabled ? "not-allowed" : loading ? "progress" : "auto",
          }}
          aria-required={required}
        />

        <div className={styles["icon-box"]}>
          {props.suffix != null && (
            <span className={styles.suffix}>{props.suffix}</span>
          )}

          <div
            className={styles.icon}
            onClick={handleVisibleSwitch}
            onKeyDown={handleKeyDown(handleVisibleSwitch)}
            role="button"
            tabIndex={0}
          >
            <ElmMdiIcon
              d={type === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.75em"
              color="gray"
            />
          </div>

          <div
            className={styles.icon}
            onClick={handleDelete}
            onKeyDown={handleKeyDown(handleDelete)}
            role="button"
            tabIndex={0}
          >
            <ElmMdiIcon d={mdiBackspaceOutline} size="1.75em" color="gray" />
          </div>
        </div>
      </div>

      <div
        className={styles.loading}
        style={{ opacity: loading ? 0.2 : 0 }}
      ></div>
    </div>
  );
};
