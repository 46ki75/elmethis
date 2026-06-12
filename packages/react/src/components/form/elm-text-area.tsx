import {
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import { mdiTextLong } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-area.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useControllableState`. The display case (read-only or upstream-driven
// text) has no "uncontrolled with default" semantic to model, so a
// direct native `value` / `defaultValue` passthrough is preferred over the
// controlled/uncontrolled split.
export interface ElmTextAreaProps extends ComponentPropsWithoutRef<"textarea"> {
  label: string;

  /**
   * Custom icon rendered in the header. Defaults to a text-long glyph.
   */
  icon?: ReactNode;

  isLoading?: boolean;

  /**
   * Visible rows on initial render. The textarea is vertically
   * resizable by default, so this is a starting height, not a cap.
   */
  rows?: number;
}

export const ElmTextArea = ({
  className,
  style,
  label,
  icon,
  maxLength,
  placeholder,
  disabled,
  isLoading,
  required,
  value,
  defaultValue,
  rows = 3,
  onInput,
  onFocus,
  onBlur,
  ...rest
}: ElmTextAreaProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // The counter reflects the live textarea length. When the parent controls
  // `value`, that drives the display directly; otherwise we track the latest
  // input locally, seeded from `defaultValue`.
  const hasTrackedValue = value != null || defaultValue != null;
  const [internalLength, setInternalLength] = useState(
    () => String(defaultValue ?? "").length,
  );
  const length = value != null ? String(value).length : internalLength;

  const handleInput: NonNullable<ElmTextAreaProps["onInput"]> = (event) => {
    setInternalLength(event.currentTarget.value.length);
    onInput?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <label
      className={clsx(
        styles["elm-text-area"],
        isFocused && styles.active,
        (disabled || isLoading) && styles.disabled,
        className,
      )}
      style={style}
    >
      <span
        className={clsx(styles.header, isFocused && styles["label-active"])}
      >
        {icon ?? <ElmMdiIcon d={mdiTextLong} size="0.75rem" />}
        <span>
          {label}
          {required && <span className={styles.requierd}>*</span>}
        </span>
        {hasTrackedValue && (
          <ElmInlineText
            color={
              maxLength != null && length > maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {maxLength != null ? `${length} / ${maxLength}` : `${length}`}
          </ElmInlineText>
        )}
      </span>

      <div className={styles.body}>
        <textarea
          value={value}
          defaultValue={defaultValue}
          rows={rows}
          maxLength={maxLength}
          className={styles.textarea}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || isLoading}
          style={{
            cursor: disabled ? "not-allowed" : isLoading ? "progress" : "auto",
          }}
          aria-required={required}
          onInput={handleInput}
          {...rest}
        />
      </div>

      <div
        className={styles.loading}
        style={{
          opacity: isLoading ? 1 : 0,
        }}
      ></div>
    </label>
  );
};
