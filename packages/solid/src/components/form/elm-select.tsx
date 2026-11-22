import { createMemo, createSignal, For, omit, onSettled, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";
import {
  mdiArrowDownDropCircleOutline,
  mdiChevronRight,
  mdiMenuDown,
} from "@mdi/js";

import { callEventHandler } from "../../primitives/call-event-handler";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { ElmCollapse } from "../containments/elm-collapse";
import { ElmInlineIcon } from "../icon/elm-inline-icon";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-select.module.css";
import textStyles from "../../styles/text.module.css";

export interface ElmSelectOption {
  id: string;
  label: string;
  /** Optional icon URL displayed alongside the option label. */
  icon?: string;
}

export interface ElmSelectProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Label for the select component. */
  label: string;

  /** Placeholder text shown when no option is selected. */
  placeholder?: string;

  /** Whether the select is disabled. */
  disabled?: boolean;

  /** Whether the select is in a loading state. */
  isLoading?: boolean;

  /** Options to display in the dropdown. */
  options: ElmSelectOption[];

  /** Currently selected option id (controlled). */
  selectedOptionId?: string | null;

  /** Initial selected option id for the uncontrolled case. */
  defaultSelectedOptionId?: string | null;

  /** Called whenever the selected option id changes. */
  onSelectedOptionIdChange?: (selectedOptionId: string | null) => void;

  /** Optional icon rendered before the label. */
  icon?: JSX.Element;
}

export const ElmSelect = (props: ElmSelectProps) => {
  const rest = omit(
    props,
    "ref",
    "class",
    "style",
    "onClick",
    "children",
    "label",
    "placeholder",
    "disabled",
    "isLoading",
    "options",
    "selectedOptionId",
    "defaultSelectedOptionId",
    "onSelectedOptionIdChange",
    "icon",
  );
  const [selected, setSelected] = createControllableSignal<string | null>({
    value: () => props.selectedOptionId,
    defaultValue: () => props.defaultSelectedOptionId ?? null,
    onChange: (selectedOptionId) =>
      props.onSelectedOptionIdChange?.(selectedOptionId),
  });
  const selectedOption = createMemo(
    () => props.options.find((option) => option.id === selected()) ?? null,
  );
  const [isOpen, setIsOpen] = createSignal(false);
  let root!: HTMLDivElement;

  onSettled(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !root.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  });

  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    callEventHandler(props.onClick, event);
    if (!event.defaultPrevented && !props.disabled && !props.isLoading) {
      setIsOpen((open) => !open);
    }
  };

  return (
    <div
      {...rest}
      ref={[
        (element) => {
          root = element;
        },
        props.ref,
      ]}
      class={clsx(
        styles["elm-select"],
        isOpen() && styles.active,
        (props.disabled || props.isLoading) && styles.disabled,
        props.class,
      )}
      style={props.style}
      onClick={handleClick}
    >
      <span class={clsx(styles.label, isOpen() && styles["label-active"])}>
        {props.icon ?? (
          <ElmMdiIcon path={mdiArrowDownDropCircleOutline} size="0.75rem" />
        )}
        {props.label}
      </span>

      <div class={styles.body}>
        <div class={clsx(styles["selected-option"], textStyles.text)}>
          <Show
            when={selectedOption()}
            keyed
            fallback={
              <div class={styles.fallback}>
                <span>{props.placeholder ?? "Select an option"}</span>
              </div>
            }
          >
            {(option) => (
              <div class={styles["option-content"]}>
                <Show when={option.icon} keyed>
                  {(icon) => <ElmInlineIcon src={icon} />}
                </Show>
                <ElmInlineText>{option.label}</ElmInlineText>
              </div>
            )}
          </Show>
        </div>

        <ElmMdiIcon path={mdiMenuDown} size="1.5rem" />

        <ElmCollapse isOpen={isOpen()} class={styles.pulldown}>
          <For each={props.options}>
            {(option) => (
              <div
                class={clsx(styles.option, textStyles.text)}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(option.id);
                  setIsOpen(false);
                }}
              >
                <ElmMdiIcon
                  path={mdiChevronRight}
                  color="var(--elmethis-color-primary-weak)"
                  size="0.75em"
                />
                <Show when={option.icon} keyed>
                  {(icon) => <ElmInlineIcon src={icon} />}
                </Show>
                <ElmInlineText>{option.label}</ElmInlineText>
              </div>
            )}
          </For>
        </ElmCollapse>
      </div>
    </div>
  );
};
