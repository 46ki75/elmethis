import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import { ElmInlineText } from "../typography/elm-inline-text";
import { useBindableSignal } from "../../hooks/use-bindable-signal";
import styles from "./elm-checkbox.module.css";

export interface ElmCheckboxProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /**
   * The label displayed.
   */
  label: string;

  /**
   * Whether the checkbox is in a loading state.
   */
  isLoading?: boolean;

  /**
   * Whether the checkbox is disabled.
   */
  disabled?: boolean;

  /**
   * Controlled checked state. When provided the parent owns the value.
   */
  checked?: boolean;

  /**
   * Initial checked state when uncontrolled.
   */
  defaultChecked?: boolean;

  /**
   * Called with the next checked value when the checkbox is toggled.
   */
  onCheckedChange?: (checked: boolean) => void;
}

export const ElmCheckbox = ({
  className,
  label,
  isLoading,
  disabled,
  checked,
  defaultChecked,
  onCheckedChange,
  ...rest
}: ElmCheckboxProps) => {
  const [isChecked, setIsChecked] = useBindableSignal<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onCheckedChange,
  });

  return (
    <div
      className={clsx(
        styles["elm-checkbox"],
        disabled && styles.disabled,
        className,
      )}
      onClick={() => {
        if (!isLoading && !disabled) {
          setIsChecked(!isChecked);
        }
      }}
      {...rest}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <svg width="24" height="24" className={styles.checkbox}>
          <circle
            cx="0"
            cy="0"
            r="2"
            className={styles["loading-dot"]}
            style={{ opacity: isLoading ? 1 : 0 }}
          >
            <animate
              attributeName="cx"
              values="4; 20; 20; 4; 4"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
            <animate
              attributeName="cy"
              values="4; 4; 20; 20; 4"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
          </circle>

          <circle
            cx="20"
            cy="20"
            r="2"
            className={styles["loading-dot"]}
            style={{ opacity: isLoading ? 1 : 0 }}
          >
            <animate
              attributeName="cx"
              values="20; 4; 4; 20; 20"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
            <animate
              attributeName="cy"
              values="20; 20; 4; 4; 20"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
          </circle>

          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            className={clsx(
              styles.rect,
              isChecked && styles.checked,
              isLoading && styles.loading,
            )}
            strokeWidth="0.8"
          />

          {isChecked && (
            <polyline
              className={styles["check-line"]}
              points="5,12 10,17 19,8"
              strokeWidth="1.5"
              fill="transparent"
            />
          )}

          <line
            x1="0"
            y1="1"
            x2="4"
            y2="1"
            strokeWidth="2"
            fill="transparent"
          />
          <line
            x1="4"
            y1="0"
            x2="24"
            y2="0"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="4"
            x2="0"
            y2="16"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="18"
            x2="0"
            y2="20"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="24"
            x2="20"
            y2="24"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="20"
            y1="23"
            x2="24"
            y2="23"
            strokeWidth="1.5"
            fill="transparent"
          />
          <line
            x1="24"
            y1="4"
            x2="24"
            y2="20"
            style={{ strokeWidth: "1px" }}
            fill="transparent"
          />
        </svg>
        <ElmInlineText>{label}</ElmInlineText>
      </div>
    </div>
  );
};
