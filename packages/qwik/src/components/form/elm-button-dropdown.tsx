import {
  $,
  component$,
  PropsOf,
  QRL,
  Signal,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";
import { mdiChevronRight, mdiMenuDown } from "@mdi/js";

import { ElmButton } from "./elm-button";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmCollapse } from "../containments/elm-collapse";
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
  onClick$?: QRL<() => void>;
}

// Display/form dual-use component: like ElmSelect, it binds a
// `selectedOptionId: Signal<string | null>` directly rather than adopting
// `useBindableSignal`'s controlled/uncontrolled split.
export interface ElmButtonDropdownProps extends Omit<
  PropsOf<"div">,
  "onClick$"
> {
  /**
   * Main button content shown when no option is selected (placeholder).
   */
  label?: string;

  /**
   * Entries shown in the dropdown menu.
   */
  items: ElmButtonDropdownItem[];

  /**
   * Currently selected option id. The main button displays the matching item.
   */
  selectedOptionId: Signal<string | null>;

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
  onClick$?: QRL<(selectedItem: ElmButtonDropdownItem | null) => void>;

  /**
   * Called with the clicked dropdown item.
   */
  onItemClick$?: QRL<(item: ElmButtonDropdownItem) => void>;

  /**
   * Called whenever the dropdown opens or closes.
   */
  onOpenChange$?: QRL<(isOpen: boolean) => void>;
}

export const ElmButtonDropdown = component$<ElmButtonDropdownProps>((props) => {
  const {
    class: className,
    style,
    label,
    items,
    selectedOptionId,
    primary = true,
    color,
    block,
    disabled,
    disableMainButton,
    disableDropdown,
    isLoading,
    dropdownIcon = mdiMenuDown,
    onClick$,
    onItemClick$,
    onOpenChange$,
    ...rest
  } = props;

  const selectedOption = useComputed$(
    () => items.find((item) => item.id === selectedOptionId.value) ?? null,
  );

  const isOpen = useSignal(false);
  const containerRef = useSignal<Element>();

  // Single source for open/close so the open-change callback fires from every
  // path (caret, item select, outside click).
  const setOpen$ = $((next: boolean) => {
    if (isOpen.value === next) return;
    isOpen.value = next;
    void onOpenChange$?.(next);
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handler = (event: MouseEvent) => {
      if (!isOpen.value || !containerRef.value) return;
      const target = event.target as Node;
      if (!containerRef.value.contains(target)) {
        void setOpen$(false);
      }
    };
    document.addEventListener("click", handler);
    cleanup(() => document.removeEventListener("click", handler));
  });

  const dropdownDisabled = disabled || disableDropdown || isLoading;
  const mainDisabled = disabled || disableMainButton;

  return (
    <div
      ref={containerRef}
      class={[styles["elm-button-dropdown"], block && styles.block, className]}
      style={style}
      {...rest}
    >
      <ElmButton
        class={[styles.main, styles.segment]}
        primary={primary}
        color={color}
        isLoading={isLoading}
        disabled={mainDisabled}
        onClick$={$(() => {
          void onClick$?.(selectedOption.value);
        })}
      >
        {selectedOption.value ? (
          <>
            {selectedOption.value.icon && (
              <ElmInlineIcon src={selectedOption.value.icon} />
            )}
            {selectedOption.value.label}
          </>
        ) : (
          label
        )}
      </ElmButton>

      <ElmButton
        class={[styles.caret, styles.segment]}
        primary={primary}
        color={color}
        disabled={dropdownDisabled}
        aria-label="Toggle dropdown"
        aria-expanded={isOpen.value}
        onClick$={$(() => {
          void setOpen$(!isOpen.value);
        })}
      >
        <ElmMdiIcon d={dropdownIcon} size="1.25rem" />
      </ElmButton>

      <ElmCollapse isOpen={isOpen.value} class={styles.menu}>
        {items.map((item) => (
          <div
            key={item.id}
            class={[
              styles.item,
              textStyles.text,
              item.id === selectedOptionId.value && styles.selected,
              item.disabled && styles["item-disabled"],
            ]}
            aria-selected={item.id === selectedOptionId.value}
            onClick$={(event) => {
              event.stopPropagation();
              if (item.disabled) return;
              selectedOptionId.value = item.id;
              void item.onClick$?.();
              void onItemClick$?.(item);
              if (props.autoClose !== false) {
                void setOpen$(false);
              }
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
});
