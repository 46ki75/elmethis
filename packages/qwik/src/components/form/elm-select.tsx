import {
  $,
  component$,
  PropsOf,
  Signal,
  useComputed$,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
  type JSXOutput,
} from "@builder.io/qwik";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import styles from "./elm-select.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmCollapse } from "../containments/elm-collapse";

export interface ElmSelectOption {
  id: string;
  slot: JSXOutput;
}

export interface ElmSelectProps extends PropsOf<"div"> {
  /**
   * Label for the select component.
   */
  label: string;

  /**
   * Icon for the select component.
   * This is displayed on the left side of the label.
   * If not provided, a default dropdown icon is used.
   *
   * @example <ElmSelectSlot icon={<ElmInlineIcon src={url} />} />
   */
  icon?: JSXOutput;

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
    icon,
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
        {icon ? (
          <div class={styles.icon}>{icon}</div>
        ) : (
          <ElmMdiIcon d={mdiArrowDownDropCircleOutline} size="0.75rem" />
        )}
        {label}
      </span>

      <div class={styles.body}>
        <div class={[styles["selected-option"], textStyles.text]}>
          {selectedOption.value ? (
            <div key={selectedOption.value.id}>{selectedOption.value.slot}</div>
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
              {option.slot}
            </div>
          ))}
        </ElmCollapse>
      </div>
    </div>
  );
});
