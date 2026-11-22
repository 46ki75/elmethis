import {
  createEffect,
  createStore,
  For,
  omit,
  Show,
  type Accessor,
} from "solid-js";
import type { JSX } from "@solidjs/web";
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

export const ElmAgUiPromptPicker = (local: ElmAgUiPromptPickerProps) => {
  const rest = omit(
    local,
    "class",
    "children",
    "prompts",
    "onPick",
    "activeIndex",
    "triggerDescriptor",
    "clearTriggerDescriptor",
  );
  const { Modal, show, hide } = createModal();
  const [active, setActive] = createStore<ActivePrompt>({
    descriptor: null,
    values: {},
    submitting: false,
    error: null,
  });
  let firstField: HTMLInputElement | HTMLSelectElement | undefined;

  createEffect(
    () => active.descriptor,
    (descriptor) => {
      if (!descriptor) {
        return undefined;
      }
      const frame = requestAnimationFrame(() => firstField?.focus());
      return () => cancelAnimationFrame(frame);
    },
  );

  const selectPrompt = async (descriptor: ElmAgUiPromptDescriptor) => {
    const args = descriptor.arguments ?? [];
    if (args.length === 0) {
      await local.onPick(descriptor.key, {});
      return;
    }
    setActive(() => ({
      descriptor,
      values: Object.fromEntries(
        args.map((argument) => [
          argument.name,
          argument.default ?? argument.enum?.[0] ?? "",
        ]),
      ),
      submitting: false,
      error: null,
    }));
    show();
  };

  createEffect(
    () => local.triggerDescriptor?.(),
    (descriptor) => {
      if (descriptor) {
        local.clearTriggerDescriptor?.();
        void selectPrompt(descriptor);
      }
    },
  );

  const setError = (error: string | null) => {
    setActive((draft) => {
      draft.error = error;
    });
  };
  const setValue = (key: string, value: string) => {
    setActive((draft) => {
      draft.values[key] = value;
    });
  };

  const cancel = () => {
    hide();
    setError(null);
  };

  const submit = async () => {
    const descriptor = active.descriptor;
    if (!descriptor) {
      return;
    }
    const args = descriptor.arguments ?? [];
    for (const argument of args) {
      if (argument.required && !(active.values[argument.name] ?? "").trim()) {
        setError(`"${argument.name}" is required.`);
        return;
      }
    }

    const payload: Record<string, string> = {};
    for (const argument of args) {
      const value = active.values[argument.name] ?? "";
      if (argument.required || value !== "") {
        payload[argument.name] = value;
      }
    }
    for (const argument of args) {
      if (!argument.pattern || payload[argument.name] === undefined) {
        continue;
      }
      const source = /^\^|\$$/.test(argument.pattern)
        ? argument.pattern
        : `^(?:${argument.pattern})$`;
      let expression: RegExp;
      try {
        expression = new RegExp(source);
      } catch {
        setError(`"${argument.name}" has an invalid pattern definition.`);
        return;
      }
      if (!expression.test(payload[argument.name])) {
        setError(argument.patternMessage ?? `"${argument.name}" is invalid.`);
        return;
      }
    }

    setActive((draft) => {
      draft.error = null;
      draft.submitting = true;
    });
    try {
      await local.onPick(descriptor.key, payload);
      hide();
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setActive((draft) => {
        draft.submitting = false;
      });
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
                                if (index() === 0) {
                                  firstField = element;
                                }
                              }}
                              class={styles["field-input"]}
                              type="text"
                              placeholder={argument.description}
                              value={active.values[argument.name] ?? ""}
                              aria-required={
                                argument.required ? "true" : undefined
                              }
                              pattern={argument.pattern}
                              title={
                                argument.patternMessage ?? argument.description
                              }
                              onInput={(event) =>
                                setValue(
                                  argument.name,
                                  event.currentTarget.value,
                                )
                              }
                            />
                          }
                        >
                          <select
                            ref={(element) => {
                              if (index() === 0) {
                                firstField = element;
                              }
                            }}
                            class={styles["field-input"]}
                            value={active.values[argument.name] ?? ""}
                            aria-required={
                              argument.required ? "true" : undefined
                            }
                            onChange={(event) =>
                              setValue(argument.name, event.currentTarget.value)
                            }
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
