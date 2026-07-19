/* eslint-disable solid/reactivity -- createMutable is intentionally mutated in place. */
import {
  createEffect,
  For,
  onCleanup,
  Show,
  splitProps,
  type Accessor,
  type JSX,
} from "solid-js";
import { createMutable } from "solid-js/store";
import { clsx } from "clsx";

import { createModal } from "../../../primitives/create-modal";
import styles from "./elm-ag-ui-prompt-picker.module.css";

export interface ElmAgUiPromptDescriptor {
  key: string;
  name: string;
  description?: string;
  arguments?: ElmAgUiPromptArgument[];
}

export interface ElmAgUiPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
  enum?: string[];
  pattern?: string;
  patternMessage?: string;
  default?: string;
}

export interface ElmAgUiPromptPickerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  prompts: ElmAgUiPromptDescriptor[];
  onPick: (key: string, args: Record<string, string>) => Promise<void> | void;
  activeIndex?: number;
  triggerDescriptor?: Accessor<ElmAgUiPromptDescriptor | null>;
  clearTriggerDescriptor?: () => void;
}

interface ActivePrompt {
  descriptor: ElmAgUiPromptDescriptor | null;
  values: Record<string, string>;
  submitting: boolean;
  error: string | null;
}

export const ElmAgUiPromptPicker = (props: ElmAgUiPromptPickerProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "prompts",
    "onPick",
    "activeIndex",
    "triggerDescriptor",
    "clearTriggerDescriptor",
  ]);
  const { Modal, show, hide } = createModal();
  const active = createMutable<ActivePrompt>({
    descriptor: null,
    values: {},
    submitting: false,
    error: null,
  });
  let firstField: HTMLInputElement | HTMLSelectElement | undefined;

  createEffect(() => {
    if (!active.descriptor) return;
    const frame = requestAnimationFrame(() => firstField?.focus());
    onCleanup(() => cancelAnimationFrame(frame));
  });

  const selectPrompt = async (descriptor: ElmAgUiPromptDescriptor) => {
    const args = descriptor.arguments ?? [];
    if (args.length === 0) {
      await local.onPick(descriptor.key, {});
      return;
    }
    active.values = Object.fromEntries(
      args.map((argument) => [
        argument.name,
        argument.default ?? argument.enum?.[0] ?? "",
      ]),
    );
    active.descriptor = descriptor;
    active.submitting = false;
    active.error = null;
    show();
  };

  createEffect(() => {
    const descriptor = local.triggerDescriptor?.();
    if (!descriptor) return;
    local.clearTriggerDescriptor?.();
    void selectPrompt(descriptor);
  });

  const cancel = () => {
    hide();
    active.error = null;
  };

  const submit = async () => {
    const descriptor = active.descriptor;
    if (!descriptor) return;
    const args = descriptor.arguments ?? [];
    for (const argument of args) {
      if (argument.required && !(active.values[argument.name] ?? "").trim()) {
        active.error = `"${argument.name}" is required.`;
        return;
      }
    }

    const payload: Record<string, string> = {};
    for (const argument of args) {
      const value = active.values[argument.name] ?? "";
      if (argument.required || value !== "") payload[argument.name] = value;
    }
    for (const argument of args) {
      if (!argument.pattern || payload[argument.name] === undefined) continue;
      const source = /^\^|\$$/.test(argument.pattern)
        ? argument.pattern
        : `^(?:${argument.pattern})$`;
      let expression: RegExp;
      try {
        expression = new RegExp(source);
      } catch {
        active.error = `"${argument.name}" has an invalid pattern definition.`;
        return;
      }
      if (!expression.test(payload[argument.name])) {
        active.error =
          argument.patternMessage ?? `"${argument.name}" is invalid.`;
        return;
      }
    }

    active.error = null;
    active.submitting = true;
    try {
      await local.onPick(descriptor.key, payload);
      hide();
    } catch (error) {
      active.error = error instanceof Error ? error.message : String(error);
    } finally {
      active.submitting = false;
    }
  };

  return (
    <>
      <div {...rest} class={clsx(styles.panel, local.class)}>
        <Show
          when={local.prompts.length > 0}
          fallback={<div class={styles.empty}>No prompts available.</div>}
        >
          <For each={local.prompts}>
            {(prompt, index) => (
              <button
                type="button"
                class={clsx(
                  styles["prompt-row"],
                  index() === local.activeIndex && styles["prompt-row-active"],
                )}
                onClick={() => void selectPrompt(prompt)}
              >
                <span class={styles["prompt-head"]}>
                  <span class={styles["prompt-name"]}>{prompt.name}</span>
                </span>
                <Show when={prompt.description} keyed>
                  {(description) => (
                    <span class={styles["prompt-description"]}>
                      {description}
                    </span>
                  )}
                </Show>
              </button>
            )}
          </For>
        </Show>
      </div>

      <Modal>
        <div class={styles["modal-card"]}>
          <Show when={active.descriptor} keyed>
            {(descriptor) => (
              <>
                <div class={styles["modal-header"]}>
                  <span class={styles["modal-title"]}>{descriptor.name}</span>
                  <Show when={descriptor.description} keyed>
                    {(description) => (
                      <span class={styles["modal-description"]}>
                        {description}
                      </span>
                    )}
                  </Show>
                </div>
                <div class={styles.form}>
                  <For each={descriptor.arguments ?? []}>
                    {(argument, index) => (
                      <label class={styles["field-label"]}>
                        <span class={styles["field-name"]}>
                          {argument.name}
                          <Show when={argument.required}>
                            <span class={styles["field-required"]}>*</span>
                          </Show>
                        </span>
                        <Show
                          when={argument.enum?.length}
                          fallback={
                            <input
                              ref={(element) => {
                                if (index() === 0) firstField = element;
                              }}
                              class={styles["field-input"]}
                              type="text"
                              placeholder={argument.description}
                              value={active.values[argument.name] ?? ""}
                              aria-required={argument.required}
                              pattern={argument.pattern}
                              title={
                                argument.patternMessage ?? argument.description
                              }
                              onInput={(event) => {
                                active.values[argument.name] =
                                  event.currentTarget.value;
                              }}
                            />
                          }
                        >
                          <select
                            ref={(element) => {
                              if (index() === 0) firstField = element;
                            }}
                            class={styles["field-input"]}
                            value={active.values[argument.name] ?? ""}
                            aria-required={argument.required}
                            onChange={(event) => {
                              active.values[argument.name] =
                                event.currentTarget.value;
                            }}
                          >
                            <Show when={!argument.required}>
                              <option value="">(none)</option>
                            </Show>
                            <For each={argument.enum}>
                              {(value) => (
                                <option value={value}>{value}</option>
                              )}
                            </For>
                          </select>
                        </Show>
                        <Show when={argument.enum && argument.description}>
                          <span class={styles["field-hint"]}>
                            {argument.description}
                          </span>
                        </Show>
                      </label>
                    )}
                  </For>
                  <Show when={active.error} keyed>
                    {(error) => <div class={styles.error}>{error}</div>}
                  </Show>
                </div>
                <div class={styles["form-actions"]}>
                  <button
                    type="button"
                    class={styles["cancel-button"]}
                    onClick={cancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class={styles["use-button"]}
                    disabled={active.submitting}
                    onClick={() => void submit()}
                  >
                    {active.submitting ? "Resolving..." : "Use prompt"}
                  </button>
                </div>
              </>
            )}
          </Show>
        </div>
      </Modal>
    </>
  );
};
