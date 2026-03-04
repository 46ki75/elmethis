import {
  $,
  component$,
  useOnDocument,
  useSignal,
  type Signal,
} from "@builder.io/qwik";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import styles from "./elm-select.module.scss";
import textStyles from "../../styles/text.module.scss";

export interface ElmSelectOption {
  id: string;
  label: string;
  description?: string;
}

export interface ElmSelectProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  options: ElmSelectOption[]; // Pass as plain array, Qwik tracks changes
  selectedOption?: Signal<ElmSelectOption | null>;
}

export const ElmSelect = component$<ElmSelectProps>((props) => {
  const internalSelected = useSignal<ElmSelectOption | null>(null);
  const selectedOption = props.selectedOption ?? internalSelected;

  const isActive = useSignal(false);
  const containerRef = useSignal<Element>();

  const handleToggle = $(() => {
    if (!props.disabled && !props.loading) {
      isActive.value = !isActive.value;
    }
  });

  const handleSelect = $((id: string) => {
    if (props.options) {
      const selected = props.options.find((option) => option.id === id);
      if (selected) {
        selectedOption.value = selected;
        // Close on select
        // isActive.value = false; // Optional: close immediately or keep open? Usually close.
      }
    }
  });

  useOnDocument(
    "click",
    $((event) => {
      if (isActive.value && containerRef.value) {
        const target = event.target as Node;
        if (!containerRef.value.contains(target)) {
          isActive.value = false;
        }
      }
    }),
  );

  return (
    <div
      ref={containerRef}
      class={[styles.wrapper, isActive.value && styles.active]}
      style={{
        backgroundColor:
          props.disabled || props.loading ? "rgba(0,0,0,0.15)" : undefined,
        "--highlight-color": isActive.value ? "#bfa056" : undefined,
      }}
      onClick$={handleToggle}
    >
      <div class={styles.header}>
        <span class={[styles.label, textStyles.text]}>{props.label}</span>
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
                <span>{props.placeholder ?? "Select an option"}</span>
              </div>
            )}
          </div>

          <ElmMdiIcon d={mdiMenuDown} size="1.5rem" />

          {isActive.value && (
            <div class={styles.pulldown}>
              {props.options.map((option) => (
                <div
                  key={option.id}
                  class={[styles.option, textStyles.text]}
                  onClick$={(e) => {
                    e.stopPropagation(); // Prevent closing immediately due to toggle? No, toggle handles click on wrapper.
                    // Wait, wrapper click triggers toggle. If I click option, event bubbles to wrapper -> toggle.
                    // So if open, clicking wrapper toggles it closed.
                    // I need to handle selection.
                    handleSelect(option.id);
                    isActive.value = false;
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
