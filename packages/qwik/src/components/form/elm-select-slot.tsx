import {
  $,
  component$,
  PropsOf,
  useComputed$,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
  type JSXOutput,
  type PropFunction,
} from "@builder.io/qwik";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { useControllableState } from "../../hooks/use-controllable-state";
import styles from "./elm-select-slot.module.css";
import textStyles from "../../styles/text.module.css";
import { ElmCollapse } from "../containments/elm-collapse";

export interface ElmSelectSlotOption {
  id: string;
  slot: JSXOutput;
}

export interface ElmSelectSlotProps extends PropsOf<"div"> {
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
  options: ElmSelectSlotOption[];

  /**
   * Controlled selected option. When provided the parent owns the state.
   * Pass `null` to explicitly clear the selection in controlled mode.
   */
  selectedOption?: ElmSelectSlotOption | null;

  /**
   * Initial selected option when uncontrolled.
   */
  defaultSelectedOption?: ElmSelectSlotOption | null;

  /**
   * Called whenever the selected option changes.
   */
  onSelectedOptionChange$?: PropFunction<
    (option: ElmSelectSlotOption | null) => void
  >;

  /**
   * Controlled open state of the dropdown.
   */
  open?: boolean;

  /**
   * Initial open state when uncontrolled.
   */
  defaultOpen?: boolean;

  /**
   * Called whenever the dropdown open state changes.
   */
  onOpenChange$?: PropFunction<(open: boolean) => void>;
}

export const ElmSelectSlot = component$<ElmSelectSlotProps>((props) => {
  const {
    class: className,
    style,
    label,
    placeholder,
    disabled,
    loading,
    options,
    icon,
    selectedOption: _selectedOptionProp,
    defaultSelectedOption,
    onSelectedOptionChange$,
    open: _open,
    defaultOpen,
    onOpenChange$,
    ...rest
  } = props;

  const [selectedOption, setSelectedOption] = useControllableState({
    prop: useComputed$(() => props.selectedOption),
    defaultProp: defaultSelectedOption ?? null,
    onChange: onSelectedOptionChange$,
  });

  const [isOpen, setIsOpen] = useControllableState({
    prop: useComputed$(() => props.open),
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange$,
  });

  const containerRef = useSignal<Element>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const handler = (event: MouseEvent) => {
      if (!isOpen.value || !containerRef.value) return;
      const target = event.target as Node;
      if (!containerRef.value.contains(target)) {
        void setIsOpen(false);
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
          setIsOpen(!isOpen.value);
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
                setSelectedOption(option);
                setIsOpen(false);
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
