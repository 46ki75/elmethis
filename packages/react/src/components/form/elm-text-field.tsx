import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import {
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiText,
  mdiTrashCanOutline,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-field.module.css";

export interface ElmTextFieldProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "prefix"
> {
  label: string;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;

  /**
   * The leading icon slot. Defaults to an `mdiText` icon.
   */
  icon?: ReactNode;

  isPassword?: boolean;
  required?: boolean;
}

export const ElmTextField = ({
  className,
  style,
  label,
  maxLength,
  prefix,
  suffix,
  placeholder,
  disabled,
  isLoading,
  icon,
  value,
  isPassword,
  required,
  onFocus,
  onBlur,
  ...rest
}: ElmTextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [inputType, setInputType] = useState(isPassword ? "password" : "text");

  // Mirrors the qwik twin's clear/toggle imperative writes: dispatch a native
  // input event so a parent listening on `onChange`/`onInput` is notified.
  const setNativeValue = (next: string) => {
    const el = inputRef.current;
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(el, next);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const valueLength = value != null ? String(value).length : 0;

  return (
    <label
      className={clsx(
        styles["elm-text-field"],
        isFocused && styles.active,
        (disabled || isLoading) && styles.disabled,
        className,
      )}
      style={style}
    >
      <span
        className={clsx(styles.header, isFocused && styles["label-active"])}
      >
        {icon ?? <ElmMdiIcon d={mdiText} size="0.75rem" />}
        <span>
          {label}
          {required && <span className={styles.requierd}>*</span>}
        </span>
        {value != null && (
          <ElmInlineText
            color={
              maxLength != null && valueLength > maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {maxLength != null
              ? `${valueLength} / ${maxLength}`
              : `${valueLength}`}
          </ElmInlineText>
        )}
      </span>

      <div className={styles.body}>
        {prefix && <span className={styles["prefix-suffix"]}>{prefix}</span>}
        <input
          {...rest}
          ref={inputRef}
          value={value}
          type={inputType}
          className={styles.input}
          placeholder={placeholder}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          disabled={disabled || isLoading}
          style={{
            cursor: disabled ? "not-allowed" : isLoading ? "progress" : "auto",
          }}
          aria-required={required}
        />

        <div className={styles["right-icon-box"]}>
          <span className={styles["prefix-suffix"]}>
            {suffix != null && <ElmInlineText>{suffix}</ElmInlineText>}
          </span>

          <div
            className={styles["clickable-icon"]}
            onClick={() => {
              if (!isLoading && !disabled) {
                setInputType((prev) => (prev === "text" ? "password" : "text"));
              }
            }}
          >
            <ElmMdiIcon
              d={inputType === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.25rem"
              color="gray"
            />
          </div>

          <div
            className={styles["clickable-icon"]}
            onClick={() => {
              if (!isLoading && !disabled) {
                setNativeValue("");
              }
            }}
          >
            <ElmMdiIcon d={mdiTrashCanOutline} size="1.25rem" color="gray" />
          </div>
        </div>
      </div>

      <div
        className={styles.loading}
        style={{ opacity: isLoading ? 1 : 0 } as CSSProperties}
      ></div>
    </label>
  );
};
