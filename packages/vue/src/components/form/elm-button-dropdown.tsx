import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  type HTMLAttributes,
  type PropType,
} from "vue";
import { clsx } from "clsx";
import { useVModel } from "@vueuse/core";
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
  onClick?: () => void;
}

export interface ElmButtonDropdownProps extends Omit<
  HTMLAttributes,
  "onClick"
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
   * Currently selected option id. Bind with `v-model:selected-option-id`
   * (prop `selectedOptionId` + `update:selectedOptionId` event). The main
   * button displays the matching item.
   */
  selectedOptionId?: string | null;

  /**
   * Initial selected option id for the uncontrolled case.
   */
  defaultSelectedOptionId?: string | null;

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
}

export const ElmButtonDropdown = defineComponent({
  name: "ElmButtonDropdown",
  props: {
    label: { type: String, default: undefined },
    items: {
      type: Array as PropType<ElmButtonDropdownItem[]>,
      required: true,
    },
    selectedOptionId: {
      type: String as PropType<string | null>,
      default: undefined,
    },
    defaultSelectedOptionId: {
      type: String as PropType<string | null>,
      default: null,
    },
    primary: { type: Boolean, default: true },
    color: { type: String, default: undefined },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: undefined },
    disableMainButton: { type: Boolean, default: false },
    disableDropdown: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    autoClose: { type: Boolean, default: true },
    dropdownIcon: { type: String, default: mdiMenuDown },
  },
  emits: ["update:selectedOptionId", "click", "itemClick", "openChange"],
  setup(props, { emit, slots }) {
    // `selectedOptionId` is nullable, so `useVModel` is used directly rather
    // than `useBindableSignal` (whose `defaultValue` must be NonNullable).
    const selected = useVModel(props, "selectedOptionId", emit, {
      passive: true,
      defaultValue: props.defaultSelectedOptionId ?? null,
    });

    const isOpen = ref(false);
    const containerRef = ref<HTMLDivElement | null>(null);

    // Single source for open/close so the open-change event fires from every
    // path (caret, item select, outside click).
    const setOpen = (next: boolean): void => {
      if (isOpen.value === next) return;
      isOpen.value = next;
      emit("openChange", next);
    };

    const handleOutsideClick = (event: MouseEvent): void => {
      if (!isOpen.value || !containerRef.value) return;
      if (!containerRef.value.contains(event.target as Node)) setOpen(false);
    };
    onMounted(() => document.addEventListener("click", handleOutsideClick));
    onBeforeUnmount(() =>
      document.removeEventListener("click", handleOutsideClick),
    );

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => {
      const selectedItem =
        props.items.find((item) => item.id === selected.value) ?? null;
      const dropdownDisabled =
        props.disabled || props.disableDropdown || props.isLoading;
      const mainDisabled = props.disabled || props.disableMainButton;

      // ElmButton intercepts `onClick` through attrs (inheritAttrs: false) but
      // does not declare it as a prop, so it is spread from a variable — a
      // non-literal spread carries the extra `onClick` / `aria-*` attrs through
      // without tripping JSX prop-name checking.
      const mainButtonProps = {
        class: clsx(styles["main"], styles["segment"]),
        primary: props.primary,
        color: props.color,
        isLoading: props.isLoading,
        disabled: mainDisabled,
        onClick: () => emit("click", selectedItem),
      };
      const caretButtonProps = {
        class: clsx(styles["caret"], styles["segment"]),
        primary: props.primary,
        color: props.color,
        disabled: dropdownDisabled,
        "aria-label": "Toggle dropdown",
        "aria-expanded": isOpen.value,
        onClick: () => setOpen(!isOpen.value),
      };

      return (
        <div
          ref={containerRef}
          class={clsx(
            styles["elm-button-dropdown"],
            props.block && styles["block"],
          )}
        >
          <ElmButton {...mainButtonProps}>
            {selectedItem ? (
              <>
                {selectedItem.icon && <ElmInlineIcon src={selectedItem.icon} />}
                {selectedItem.label}
              </>
            ) : (
              <>
                {slots.icon?.()}
                {props.label}
              </>
            )}
          </ElmButton>

          <ElmButton {...caretButtonProps}>
            <ElmMdiIcon d={props.dropdownIcon} size="1.25rem" />
          </ElmButton>

          <ElmCollapse isOpen={isOpen.value} class={styles["menu"]}>
            {props.items.map((item) => (
              <div
                key={item.id}
                class={clsx(
                  styles["item"],
                  textStyles.text,
                  item.id === selected.value && styles["selected"],
                  item.disabled && styles["item-disabled"],
                )}
                aria-selected={item.id === selected.value}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation();
                  if (item.disabled) return;
                  selected.value = item.id;
                  item.onClick?.();
                  emit("itemClick", item);
                  if (props.autoClose) setOpen(false);
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
  },
});
