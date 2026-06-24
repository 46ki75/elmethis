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
import { mdiChevronRight, mdiMenuDown } from "@mdi/js";

import { ElmButton } from "./elm-button";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmCollapse } from "../containments/elm-collapse";
import { useBindableSignal } from "../../hooks/use-bindable-signal";

import styles from "./elm-button-dropdown.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmButtonDropdownItem {
  id: string;
  label: string;
  /**
   * Optional icon URL displayed alongside the item label.
   */
  icon?: string;
  /**
   * Whether the item is disabled and cannot be clicked.
   */
  disabled?: boolean;
  /**
   * Called when this item is clicked.
   */
  onClick?: () => void;
}

export interface ElmButtonDropdownProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onClick"
> {
  /**
   * Main button content shown when no option is selected (placeholder).
   */
  label?: ReactNode;

  /**
   * Optional icon rendered before the main button label in the placeholder
   * (no selection) state.
   */
  icon?: ReactNode;

  /**
   * Entries shown in the dropdown menu.
   */
  items: ElmButtonDropdownItem[];

  /**
   * Currently selected option id (controlled). The main button displays the
   * matching item.
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
   * Whether the button uses the primary style. Defaults to `true`.
   */
  primary?: boolean;

  /**
   * Custom button color. Overrides `primary` when set.
   */
  color?: string;

  /**
   * Whether the control fills the width of its container.
   */
  block?: boolean;

  /**
   * Whether the whole control is disabled.
   */
  disabled?: boolean;

  /**
   * Whether only the main button is disabled. The dropdown caret stays
   * interactive.
   */
  disableMainButton?: boolean;

  /**
   * Whether only the dropdown caret is disabled. The main button stays
   * interactive.
   */
  disableDropdown?: boolean;

  /**
   * Whether the main button is in a loading state.
   */
  isLoading?: boolean;

  /**
   * Whether the menu closes automatically after an item is clicked. Defaults
   * to `true`.
   */
  autoClose?: boolean;

  /**
   * mdi path for the caret icon. Defaults to `mdiMenuDown`.
   */
  dropdownIcon?: string;

  /**
   * Main button click handler. Receives the currently selected item, or
   * `null` when nothing is selected.
   */
  onClick?: (selectedItem: ElmButtonDropdownItem | null) => void;

  /**
   * Called with the clicked dropdown item.
   */
  onItemClick?: (item: ElmButtonDropdownItem) => void;

  /**
   * Called whenever the dropdown opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void;
}

export const ElmButtonDropdown = ({
  className,
  style,
  label,
  icon,
  items,
  selectedOptionId,
  defaultSelectedOptionId = null,
  onSelectedOptionIdChange,
  primary = true,
  color,
  block,
  disabled,
  disableMainButton,
  disableDropdown,
  isLoading,
  autoClose = true,
  dropdownIcon = mdiMenuDown,
  onClick,
  onItemClick,
  onOpenChange,
  ...rest
}: ElmButtonDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useBindableSignal<string | null>({
    value: selectedOptionId,
    defaultValue: defaultSelectedOptionId,
    onChange: onSelectedOptionIdChange,
  });

  const selectedItem = items.find((item) => item.id === selected) ?? null;

  const setOpen = useCallback(
    (next: boolean) => {
      setIsOpen((prev) => {
        if (prev !== next) onOpenChange?.(next);
        return next;
      });
    },
    [onOpenChange],
  );

  // Close on outside click, mirroring ElmSelect's dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isOpen, setOpen]);

  const dropdownDisabled = disabled || disableDropdown || isLoading;
  const mainDisabled = disabled || disableMainButton;

  const handleToggle = useCallback(() => {
    if (!dropdownDisabled) setOpen(!isOpen);
  }, [dropdownDisabled, isOpen, setOpen]);

  const handleItemClick = useCallback(
    (item: ElmButtonDropdownItem) => {
      if (item.disabled) return;
      setSelected(item.id);
      item.onClick?.();
      onItemClick?.(item);
      if (autoClose) setOpen(false);
    },
    [setSelected, autoClose, onItemClick, setOpen],
  );

  const caret = <ElmMdiIcon d={dropdownIcon} size="1.25rem" />;

  return (
    <div
      ref={rootRef}
      className={clsx(
        styles["elm-button-dropdown"],
        block && styles["block"],
        className,
      )}
      style={style as CSSProperties}
      {...rest}
    >
      <ElmButton
        className={clsx(styles["main"], styles["segment"])}
        type="button"
        primary={primary}
        color={color}
        isLoading={isLoading}
        disabled={mainDisabled}
        onClick={() => onClick?.(selectedItem)}
      >
        {selectedItem ? (
          <>
            {selectedItem.icon && <ElmInlineIcon src={selectedItem.icon} />}
            {selectedItem.label}
          </>
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </ElmButton>

      <ElmButton
        className={clsx(styles["caret"], styles["segment"])}
        type="button"
        primary={primary}
        color={color}
        disabled={dropdownDisabled}
        onClick={handleToggle}
        aria-label="Toggle dropdown"
        aria-expanded={isOpen}
      >
        {caret}
      </ElmButton>

      <ElmCollapse isOpen={isOpen} className={styles["menu"]}>
        {items.map((item) => (
          <div
            key={item.id}
            className={clsx(
              styles["item"],
              textStyles.text,
              item.id === selected && styles["selected"],
              item.disabled && styles["item-disabled"],
            )}
            aria-selected={item.id === selected}
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item);
            }}
          >
            <ElmMdiIcon
              d={mdiChevronRight}
              color="var(--elmethis-color-primary-weak)"
              size="0.75em"
            />
            {item.icon && <ElmInlineIcon src={item.icon} />}
            <ElmInlineText>{item.label}</ElmInlineText>
          </div>
        ))}
      </ElmCollapse>
    </div>
  );
};
