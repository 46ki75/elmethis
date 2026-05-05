import {
  $,
  component$,
  useComputed$,
  useOnDocument,
  useSignal,
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
import styles from "./elm-select.module.scss";
import textStyles from "../../styles/text.module.scss";
import { ElmCollapse } from "../containments/elm-collapse";

export interface ElmSelectSlotOption {
  id: string;
  slot: JSXOutput;
}

export interface ElmSelectSlotProps {
  class?: string;

  style?: CSSProperties;

  label: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
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
  const [selectedOption, setSelectedOption] = useControllableState({
    prop: useComputed$(() => props.selectedOption),
    defaultProp: props.defaultSelectedOption ?? null,
    onChange: props.onSelectedOptionChange$,
  });

  const [isOpen, setIsOpen] = useControllableState({
    prop: useComputed$(() => props.open),
    defaultProp: props.defaultOpen ?? false,
    onChange: props.onOpenChange$,
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
      class={[styles.wrapper, isOpen.value && styles.active, props.class]}
      style={{
        backgroundColor:
          props.disabled || props.loading ? "rgba(0,0,0,0.15)" : undefined,
        "--highlight-color": isOpen.value ? "#bfa056" : undefined,
        ...props.style,
      }}
      onClick$={$(() => {
        if (!props.disabled && !props.loading) {
          setIsOpen(!isOpen.value);
        }
      })}
    >
      <div class={styles.header}>
        <span class={[styles.label, textStyles.text]}>{props.label}</span>
      </div>

      <div class={styles.body}>
        <div class={styles.select}>
          <div class={[styles.selected, textStyles.text]}>
            {selectedOption.value ? (
              <div key={selectedOption.value.id}>
                {selectedOption.value.slot}
              </div>
            ) : (
              <div class={styles.fallback}>
                <ElmMdiIcon d={mdiArrowDownDropCircleOutline} />
                <span>{props.placeholder ?? "Select an option"}</span>
              </div>
            )}
          </div>

          <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

          <ElmCollapse isOpen={isOpen.value} class={styles.pulldown}>
            {props.options.map((option) => (
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
    </div>
  );
});
