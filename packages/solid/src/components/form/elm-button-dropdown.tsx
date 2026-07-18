import {
  createMemo,
  createSignal,
  For,
  mergeProps,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";
import { mdiChevronRight, mdiMenuDown } from "@mdi/js";

import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { ElmCollapse } from "../containments/elm-collapse";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmButton } from "./elm-button";
import styles from "./elm-button-dropdown.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmButtonDropdownItem {
  id: string;
  label: string;
  /** Optional icon URL displayed alongside the item label. */
  icon?: string;
  /** Whether the item is disabled and cannot be clicked. */
  disabled?: boolean;
  /** Called when this item is clicked. */
  onClick?: () => void;
}

export interface ElmButtonDropdownProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  /** Main button content shown when no option is selected. */
  label?: JSX.Element;

  /** Optional icon rendered before the placeholder label. */
  icon?: JSX.Element;

  /** Entries shown in the dropdown menu. */
  items: ElmButtonDropdownItem[];

  /** Currently selected option id (controlled). */
  selectedOptionId?: string | null;

  /** Initial selected option id for the uncontrolled case. */
  defaultSelectedOptionId?: string | null;

  /** Called whenever the selected option id changes. */
  onSelectedOptionIdChange?: (selectedOptionId: string | null) => void;

  /** Whether the button uses the primary style. Defaults to `true`. */
  primary?: boolean;

  /** Custom button color. Overrides `primary` when set. */
  color?: string;

  /** Whether the control fills the width of its container. */
  block?: boolean;

  /** Whether the whole control is disabled. */
  disabled?: boolean;

  /** Whether only the main button is disabled. */
  disableMainButton?: boolean;

  /** Whether only the dropdown caret is disabled. */
  disableDropdown?: boolean;

  /** Whether the main button is in a loading state. */
  isLoading?: boolean;

  /** Whether the menu closes after an item click. Defaults to `true`. */
  autoClose?: boolean;

  /** mdi path for the caret icon. Defaults to `mdiMenuDown`. */
  dropdownIcon?: string;

  /** Main button click handler. */
  onClick?: (selectedItem: ElmButtonDropdownItem | null) => void;

  /** Called with the clicked dropdown item. */
  onItemClick?: (item: ElmButtonDropdownItem) => void;

  /** Called whenever the dropdown opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export const ElmButtonDropdown = (props: ElmButtonDropdownProps) => {
  const merged = mergeProps(
    {
      defaultSelectedOptionId: null,
      primary: true,
      autoClose: true,
      dropdownIcon: mdiMenuDown,
    },
    props,
  );
  const [local, rest] = splitProps(merged, [
    "ref",
    "class",
    "style",
    "children",
    "label",
    "icon",
    "items",
    "selectedOptionId",
    "defaultSelectedOptionId",
    "onSelectedOptionIdChange",
    "primary",
    "color",
    "block",
    "disabled",
    "disableMainButton",
    "disableDropdown",
    "isLoading",
    "autoClose",
    "dropdownIcon",
    "onClick",
    "onItemClick",
    "onOpenChange",
  ]);
  const [selected, setSelected] = createControllableSignal<string | null>({
    value: () => local.selectedOptionId,
    defaultValue: () => local.defaultSelectedOptionId,
    onChange: (selectedOptionId) =>
      local.onSelectedOptionIdChange?.(selectedOptionId),
  });
  const selectedItem = createMemo(
    () => local.items.find((item) => item.id === selected()) ?? null,
  );
  const [isOpen, setIsOpen] = createSignal(false);
  let root!: HTMLDivElement;

  const setOpen = (next: boolean) => {
    if (isOpen() === next) return;
    setIsOpen(next);
    local.onOpenChange?.(next);
  };

  onMount(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen() &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    onCleanup(() => document.removeEventListener("click", handleOutsideClick));
  });

  const dropdownDisabled = () =>
    local.disabled || local.disableDropdown || local.isLoading;
  const mainDisabled = () => local.disabled || local.disableMainButton;

  const handleItemClick = (item: ElmButtonDropdownItem) => {
    if (item.disabled) return;
    setSelected(item.id);
    item.onClick?.();
    local.onItemClick?.(item);
    if (local.autoClose) setOpen(false);
  };

  return (
    <div
      {...rest}
      ref={(element) => {
        root = element;
        if (typeof local.ref === "function") local.ref(element);
      }}
      class={clsx(
        styles["elm-button-dropdown"],
        local.block && styles.block,
        local.class,
      )}
      style={local.style}
    >
      <ElmButton
        class={clsx(styles.main, styles.segment)}
        type="button"
        primary={local.primary}
        color={local.color}
        isLoading={local.isLoading}
        disabled={mainDisabled()}
        onClick={() => local.onClick?.(selectedItem())}
      >
        <Show
          when={selectedItem()}
          keyed
          fallback={
            <>
              {local.icon}
              {local.label}
            </>
          }
        >
          {(item) => (
            <>
              <Show when={item.icon} keyed>
                {(icon) => <ElmInlineIcon src={icon} />}
              </Show>
              {item.label}
            </>
          )}
        </Show>
      </ElmButton>

      <ElmButton
        class={clsx(styles.caret, styles.segment)}
        type="button"
        primary={local.primary}
        color={local.color}
        disabled={dropdownDisabled()}
        onClick={() => {
          if (!dropdownDisabled()) setOpen(!isOpen());
        }}
        aria-label="Toggle dropdown"
        aria-expanded={isOpen()}
      >
        <ElmMdiIcon d={local.dropdownIcon} size="1.25rem" />
      </ElmButton>

      <ElmCollapse isOpen={isOpen()} class={styles.menu}>
        <For each={local.items}>
          {(item) => (
            <div
              class={clsx(
                styles.item,
                textStyles.text,
                item.id === selected() && styles.selected,
                item.disabled && styles["item-disabled"],
              )}
              aria-selected={item.id === selected()}
              onClick={(event) => {
                event.stopPropagation();
                handleItemClick(item);
              }}
            >
              <ElmMdiIcon
                d={mdiChevronRight}
                color="var(--elmethis-color-primary-weak)"
                size="0.75em"
              />
              <Show when={item.icon} keyed>
                {(icon) => <ElmInlineIcon src={icon} />}
              </Show>
              <ElmInlineText>{item.label}</ElmInlineText>
            </div>
          )}
        </For>
      </ElmCollapse>
    </div>
  );
};
