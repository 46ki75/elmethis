import {
  $,
  component$,
  PropsOf,
  useComputed$,
  useOnDocument,
  useSignal,
  type CSSProperties,
  type PropFunction,
} from "@builder.io/qwik";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { useControllableState } from "../../hooks/use-controllable-state";
import styles from "./elm-select.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmSelectOption {
  id: string;
  label: string;
  description?: string;
}

export interface ElmSelectProps extends PropsOf<"div"> {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  options: ElmSelectOption[];

  /**
   * Controlled selected option. When provided the parent owns the state.
   * Pass `null` to explicitly clear the selection in controlled mode.
   */
  selectedOption?: ElmSelectOption | null;

  /**
   * Initial selected option when uncontrolled.
   */
  defaultSelectedOption?: ElmSelectOption | null;

  /**
   * Called whenever the selected option changes.
   */
  onSelectedOptionChange$?: PropFunction<
    (option: ElmSelectOption | null) => void
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

export const ElmSelect = component$<ElmSelectProps>((props) => {
  const {
    class: className,
    style,
    label,
    placeholder,
    disabled,
    loading,
    options,
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

  useOnDocument(
    "click",
    $((event) => {
      if (isOpen.value && containerRef.value) {
        const target = event.target as Node;
        if (!containerRef.value.contains(target)) {
          setIsOpen(false);
        }
      }
    }),
  );

  return (
    <div
      ref={containerRef}
      class={[styles.wrapper, isOpen.value && styles.active, className]}
      style={{
        backgroundColor:
          disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
        "--highlight-color": isOpen.value ? "#bfa056" : undefined,
        ...(style as CSSProperties),
      } as CSSProperties}
      onClick$={$(() => {
        if (!props.disabled && !props.loading) {
          setIsOpen(!isOpen.value);
        }
      })}
      {...rest}
    >
      <div class={styles.header}>
        <span class={[styles.label, textStyles.text]}>{label}</span>
      </div>

      <div class={styles.body}>
        <div class={styles.select}>
          <div class={[styles.selected, textStyles.text]}>
            {selectedOption.value ? (
              <div key={selectedOption.value.id}>
                <span>{selectedOption.value.label}</span>
                {selectedOption.value.description && (
                  <span class={styles.description}>
                    {selectedOption.value.description}
                  </span>
                )}
              </div>
            ) : (
              <div class={styles.fallback}>
                <ElmMdiIcon d={mdiArrowDownDropCircleOutline} />
                <span>{placeholder ?? "Select an option"}</span>
              </div>
            )}
          </div>

          <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

          {isOpen.value && (
            <div class={styles.pulldown}>
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
                  <ElmMdiIcon
                    d={mdiChevronRight}
                    color="#868e9c"
                    size="0.75em"
                  />
                  <span>{option.label}</span>
                  {option.description && (
                    <span class={styles.description}>{option.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
