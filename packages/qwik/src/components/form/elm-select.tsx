import {
  $,
  component$,
  PropsOf,
  Signal,
  Slot,
  useComputed$,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
} from "@qwik.dev/core";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-select.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmCollapse } from "../containments/elm-collapse";

export interface ElmSelectOption {
  id: string;
  label: string;
  /**
   * Optional icon URL displayed alongside the option label.
   */
  icon?: string;
}

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. Used both as a form selector and as a presentation
// widget reflecting upstream-owned state, so a direct
// `selectedOptionId: Signal<string | null>` binding is preferred over the
// controlled/uncontrolled split.
export interface ElmSelectProps extends PropsOf<"div"> {
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
  loading?: boolean;

  /**
   * Options to display in the dropdown.
   */
  options: ElmSelectOption[];

  selectedOptionId: Signal<string | null>;
}

export const ElmSelect = component$<ElmSelectProps>((props) => {
  const {
    class: className,
    style,
    label,
    placeholder,
    disabled,
    loading,
    options,
    selectedOptionId,
    ...rest
  } = props;

  const selectedOption = useComputed$(() =>
    options.find((o) => o.id === selectedOptionId.value) ?? null,
  );

  const isOpen = useSignal(false);

  const containerRef = useSignal<Element>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handler = (event: MouseEvent) => {
      if (!isOpen.value || !containerRef.value) return;
      const target = event.target as Node;
      if (!containerRef.value.contains(target)) {
        isOpen.value = false;
      }
    };
    document.addEventListener("click", handler);
    cleanup(() => document.removeEventListener("click", handler));
  });

  return (
    <div
      ref={containerRef}
      class={[styles.wrapper, isOpen.value && styles.active, className]}
      style={
        {
          backgroundColor: disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
          ...(style as CSSProperties),
        } as CSSProperties
      }
      onClick$={$(() => {
        if (!props.disabled && !props.loading) {
          isOpen.value = !isOpen.value;
        }
      })}
      {...rest}
    >
      <span class={[styles.label, { [styles["label-active"]]: isOpen.value }]}>
        <Slot name="icon">
          <ElmMdiIcon d={mdiArrowDownDropCircleOutline} size="0.75rem" />
        </Slot>
        {label}
      </span>

      <div class={styles.body}>
        <div class={[styles["selected-option"], textStyles.text]}>
          {selectedOption.value ? (
            <div key={selectedOption.value.id} class={styles["option-content"]}>
              {selectedOption.value.icon && (
                <ElmInlineIcon src={selectedOption.value.icon} />
              )}
              <ElmInlineText>{selectedOption.value.label}</ElmInlineText>
            </div>
          ) : (
            <div class={styles.fallback}>
              <span>{placeholder ?? "Select an option"}</span>
            </div>
          )}
        </div>

        <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

        <ElmCollapse isOpen={isOpen.value} class={styles.pulldown}>
          {options.map((option) => (
            <div
              key={option.id}
              class={[styles.option, textStyles.text]}
              onClick$={(e) => {
                e.stopPropagation();
                selectedOptionId.value = option.id;
                isOpen.value = false;
              }}
            >
              <ElmMdiIcon d={mdiChevronRight} color="#868e9c" size="0.75em" />
              {option.icon && <ElmInlineIcon src={option.icon} />}
              <ElmInlineText>{option.label}</ElmInlineText>
            </div>
          ))}
        </ElmCollapse>
      </div>
    </div>
  );
});
