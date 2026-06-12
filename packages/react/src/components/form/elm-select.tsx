import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { clsx } from "clsx";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmCollapse } from "../containments/elm-collapse";
import { useBindableSignal } from "../../hooks/use-bindable-signal";

import styles from "./elm-select.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmSelectOption {
  id: string;
  label: string;
  /**
   * Optional icon URL displayed alongside the option label.
   */
  icon?: string;
}

export interface ElmSelectProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /**
   * Label for the select component.
   */
  label: string;

  /**
   * Placeholder text shown when no option is selected.
   */
  placeholder?: string;

  /**
   * Whether the select is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the select is in a loading state.
   */
  isLoading?: boolean;

  /**
   * Options to display in the dropdown.
   */
  options: ElmSelectOption[];

  /**
   * Currently selected option id (controlled).
   */
  selectedOptionId?: string | null;

  /**
   * Initial selected option id for the uncontrolled case.
   */
  defaultSelectedOptionId?: string | null;

  /**
   * Called whenever the selected option id changes.
   */
  onSelectedOptionIdChange?: (selectedOptionId: string | null) => void;

  /**
   * Optional icon rendered before the label. Falls back to a default mdi icon.
   */
  icon?: ReactNode;
}

export const ElmSelect = ({
  className,
  style,
  label,
  placeholder,
  disabled,
  isLoading,
  options,
  selectedOptionId,
  defaultSelectedOptionId = null,
  onSelectedOptionIdChange,
  icon,
  // Destructured out so it is not spread onto the root: like the qwik twin,
  // ElmSelect consumes only the icon slot, not a default slot.
  children: _children,
  ...rest
}: ElmSelectProps) => {
  const [selected, setSelected] = useBindableSignal<string | null>({
    value: selectedOptionId,
    defaultValue: defaultSelectedOptionId,
    onChange: onSelectedOptionIdChange,
  });

  const selectedOption = options.find((o) => o.id === selected) ?? null;

  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!isOpen || !containerRef.current) return;
      const target = event.target as Node;
      if (!containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled && !isLoading) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled, isLoading]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        styles["elm-select"],
        isOpen && styles["active"],
        (disabled || isLoading) && styles["disabled"],
        className,
      )}
      style={style as CSSProperties}
      onClick={handleToggle}
      {...rest}
    >
      <span className={clsx(styles["label"], isOpen && styles["label-active"])}>
        {icon ?? (
          <ElmMdiIcon d={mdiArrowDownDropCircleOutline} size="0.75rem" />
        )}
        {label}
      </span>

      <div className={styles["body"]}>
        <div className={clsx(styles["selected-option"], textStyles.text)}>
          {selectedOption ? (
            <div key={selectedOption.id} className={styles["option-content"]}>
              {selectedOption.icon && (
                <ElmInlineIcon src={selectedOption.icon} />
              )}
              <ElmInlineText>{selectedOption.label}</ElmInlineText>
            </div>
          ) : (
            <div className={styles["fallback"]}>
              <span>{placeholder ?? "Select an option"}</span>
            </div>
          )}
        </div>

        <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

        <ElmCollapse isOpen={isOpen} className={styles["pulldown"]}>
          {options.map((option) => (
            <div
              key={option.id}
              className={clsx(styles["option"], textStyles.text)}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(option.id);
                setIsOpen(false);
              }}
            >
              <ElmMdiIcon
                d={mdiChevronRight}
                color="var(--elmethis-color-primary-weak)"
                size="0.75em"
              />
              {option.icon && <ElmInlineIcon src={option.icon} />}
              <ElmInlineText>{option.label}</ElmInlineText>
            </div>
          ))}
        </ElmCollapse>
      </div>
    </div>
  );
};
