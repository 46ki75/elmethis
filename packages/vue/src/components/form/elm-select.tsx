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
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmCollapse } from "../containments/elm-collapse";

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

export interface ElmSelectProps extends Omit<HTMLAttributes, "onChange"> {
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
   * Currently selected option id. Bind with `v-model:selected-option-id`
   * (prop `selectedOptionId` + `update:selectedOptionId` event).
   */
  selectedOptionId?: string | null;

  /**
   * Initial selected option id for the uncontrolled case.
   */
  defaultSelectedOptionId?: string | null;
}

export const ElmSelect = defineComponent({
  name: "ElmSelect",
  props: {
    label: { type: String, required: true },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    isLoading: { type: Boolean, default: false },
    options: { type: Array as PropType<ElmSelectOption[]>, required: true },
    selectedOptionId: {
      type: String as PropType<string | null>,
      default: undefined,
    },
    defaultSelectedOptionId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["update:selectedOptionId"],
  setup(props, { emit, slots }) {
    // `selectedOptionId` is nullable, so `useVModel` is used directly rather
    // than `useBindableSignal` (whose `defaultValue` must be NonNullable).
    const selected = useVModel(props, "selectedOptionId", emit, {
      passive: true,
      defaultValue: props.defaultSelectedOptionId ?? null,
    });

    const isOpen = ref(false);
    const containerRef = ref<HTMLDivElement | null>(null);

    const handleOutsideClick = (event: MouseEvent): void => {
      if (!isOpen.value || !containerRef.value) return;
      if (!containerRef.value.contains(event.target as Node)) {
        isOpen.value = false;
      }
    };
    onMounted(() => document.addEventListener("click", handleOutsideClick));
    onBeforeUnmount(() =>
      document.removeEventListener("click", handleOutsideClick),
    );

    const handleToggle = (): void => {
      if (!props.disabled && !props.isLoading) {
        isOpen.value = !isOpen.value;
      }
    };

    // inheritAttrs default: passthrough class/style merge onto the root.
    return () => {
      const selectedOption =
        props.options.find((o) => o.id === selected.value) ?? null;

      return (
        <div
          ref={containerRef}
          class={clsx(
            styles["elm-select"],
            isOpen.value && styles["active"],
            (props.disabled || props.isLoading) && styles["disabled"],
          )}
          onClick={handleToggle}
        >
          <span
            class={clsx(
              styles["label"],
              isOpen.value && styles["label-active"],
            )}
          >
            {slots.icon?.() ?? (
              <ElmMdiIcon d={mdiArrowDownDropCircleOutline} size="0.75rem" />
            )}
            {props.label}
          </span>

          <div class={styles["body"]}>
            <div class={clsx(styles["selected-option"], textStyles.text)}>
              {selectedOption ? (
                <div class={styles["option-content"]}>
                  {selectedOption.icon && (
                    <ElmInlineIcon src={selectedOption.icon} />
                  )}
                  <ElmInlineText>{selectedOption.label}</ElmInlineText>
                </div>
              ) : (
                <div class={styles["fallback"]}>
                  <span>{props.placeholder ?? "Select an option"}</span>
                </div>
              )}
            </div>

            <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

            <ElmCollapse isOpen={isOpen.value} class={styles["pulldown"]}>
              {props.options.map((option) => (
                <div
                  key={option.id}
                  class={clsx(styles["option"], textStyles.text)}
                  onClick={(event: MouseEvent) => {
                    event.stopPropagation();
                    selected.value = option.id;
                    isOpen.value = false;
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
  },
});
