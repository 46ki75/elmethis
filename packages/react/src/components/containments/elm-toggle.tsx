import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import { mdiChevronRight, mdiPlus } from "@mdi/js";

import styles from "./elm-toggle.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { useBindableSignal } from "../../hooks/use-bindable-signal";

export interface ElmToggleProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onToggle"
> {
  /**
   * The summary content of the toggle. A `string` is wrapped in
   * `ElmInlineText`; any other node (qwik's `q:slot="summary"`) is rendered
   * as-is.
   */
  summary?: ReactNode;

  /** Initial open state for uncontrolled usage. */
  defaultIsOpen?: boolean;

  /** Controlled open state. When provided the parent owns the value. */
  isOpen?: boolean;

  /** Called with the next open value when the toggle is flipped. */
  onOpenChange?: (isOpen: boolean) => void;

  monochrome?: boolean;
}

export const ElmToggle = ({
  className,
  summary,
  style,
  monochrome,
  isOpen: isOpenProp,
  defaultIsOpen,
  onOpenChange,
  children,
  ...rest
}: ElmToggleProps) => {
  const [isOpen, setIsOpen] = useBindableSignal<boolean>({
    value: isOpenProp,
    defaultValue: defaultIsOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <div
      className={clsx(styles["elm-toggle"], isOpen && styles.open, className)}
      style={style as CSSProperties}
      {...rest}
    >
      <div
        className={styles.summary}
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((prev) => !prev);
        }}
      >
        <div className={styles["summary-left"]}>
          <span className={clsx(styles.chevron, isOpen && styles.open)}>
            <ElmMdiIcon
              d={mdiChevronRight}
              color={
                monochrome
                  ? "var(--elmethis-color-neutral-weak)"
                  : "var(--elmethis-color-primary)"
              }
              size="1rem"
            />
          </span>
          <div>
            {typeof summary === "string" ? (
              <ElmInlineText>{summary}</ElmInlineText>
            ) : (
              summary
            )}
          </div>
        </div>

        <hr className={styles.divider} />

        <span className={clsx(styles.cross, isOpen && styles.open)}>
          <ElmMdiIcon
            d={mdiPlus}
            size="1rem"
            color={
              monochrome
                ? "var(--elmethis-color-neutral-weak)"
                : isOpen
                  ? "var(--elmethis-color-accent-error)"
                  : "var(--elmethis-color-primary)"
            }
          />
        </span>
      </div>

      <div className={styles.border} />

      <div className={clsx(styles.content, isOpen && styles.open)}>
        {children}
      </div>
    </div>
  );
};
