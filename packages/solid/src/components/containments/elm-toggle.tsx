import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { mdiChevronRight, mdiPlus } from "@mdi/js";

import { createControllableSignal } from "../../primitives/create-controllable-signal";
import styles from "./elm-toggle.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

export interface ElmToggleProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onToggle"
> {
  /**
   * The summary content of the toggle. A string is wrapped in ElmInlineText;
   * any other node is rendered as-is.
   */
  summary?: JSX.Element;

  /** Initial open state for uncontrolled usage. */
  defaultIsOpen?: boolean;

  /** Controlled open state. When provided, the parent owns the value. */
  isOpen?: boolean;

  /** Called with the next open value when the toggle is flipped. */
  onOpenChange?: (isOpen: boolean) => void;

  monochrome?: boolean;
}

export const ElmToggle = (props: ElmToggleProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "summary",
    "defaultIsOpen",
    "isOpen",
    "onOpenChange",
    "monochrome",
  ]);
  const [isOpen, setIsOpen] = createControllableSignal<boolean>({
    value: () => local.isOpen,
    defaultValue: () => local.defaultIsOpen ?? false,
    onChange: (value) => local.onOpenChange?.(value),
  });
  const handleSummaryClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (
    event,
  ) => {
    event.preventDefault();
    setIsOpen((previous) => !previous);
  };

  return (
    <div
      {...rest}
      class={clsx(styles["elm-toggle"], isOpen() && styles.open, local.class)}
    >
      <div class={styles.summary} onClick={handleSummaryClick}>
        <div class={styles["summary-left"]}>
          <span class={clsx(styles.chevron, isOpen() && styles.open)}>
            <ElmMdiIcon
              d={mdiChevronRight}
              color={
                local.monochrome
                  ? "var(--elmethis-color-neutral-weak)"
                  : "var(--elmethis-color-primary)"
              }
              size="1rem"
            />
          </span>
          <div>
            {typeof local.summary === "string" ? (
              <ElmInlineText>{local.summary}</ElmInlineText>
            ) : (
              local.summary
            )}
          </div>
        </div>

        <hr class={styles.divider} />

        <span class={clsx(styles.cross, isOpen() && styles.open)}>
          <ElmMdiIcon
            d={mdiPlus}
            size="1rem"
            color={
              local.monochrome
                ? "var(--elmethis-color-neutral-weak)"
                : isOpen()
                  ? "var(--elmethis-color-accent-error)"
                  : "var(--elmethis-color-primary)"
            }
          />
        </span>
      </div>

      <div class={styles.border} />

      <div class={clsx(styles.content, isOpen() && styles.open)}>
        {local.children}
      </div>
    </div>
  );
};
