import {
  $,
  component$,
  useStore,
  type CSSProperties,
  type QRL,
} from "@qwik.dev/core";

import styles from "./elm-ag-ui-prompt-picker.module.css";
import { useModal } from "../../hooks/use-modal";

/**
 * Descriptor shape consumed by `ElmAgUiPromptPicker`. Intentionally
 * kept independent from `McpPromptDescriptor` so the picker component
 * does not pull in MCP-specific types — anything mappable to this
 * shape can drive the UI.
 */
export interface ElmAgUiPromptDescriptor {
  /**
   * Stable identifier the parent uses to look this prompt up when the
   * user picks it. Forwarded to `onPick$` verbatim.
   */
  key: string;
  /** Display name shown in the picker list. */
  name: string;
  /** Optional descriptive blurb shown under the name. */
  description?: string;
  /**
   * Argument fields shown as a modal form when the user clicks the
   * prompt. Omit (or empty array) for prompts that take no arguments
   * — the picker will pick immediately on click.
   */
  arguments?: {
    name: string;
    description?: string;
    required?: boolean;
  }[];
}

export interface ElmAgUiPromptPickerProps {
  class?: string;
  style?: CSSProperties;
  prompts: ElmAgUiPromptDescriptor[];
  /**
   * Invoked when the user picks a prompt. For no-arg prompts, fires
   * immediately on click. For prompts with arguments, fires after the
   * user fills the modal form and clicks "Use prompt".
   */
  onPick$: QRL<
    (key: string, args: Record<string, string>) => Promise<void> | void
  >;
}

interface ActivePrompt {
  /** Currently-active descriptor, or `null` when the modal is idle. */
  descriptor: ElmAgUiPromptDescriptor | null;
  values: Record<string, string>;
  submitting: boolean;
  error: string | null;
}

export const ElmAgUiPromptPicker = component$<ElmAgUiPromptPickerProps>(
  ({ class: className, style, prompts, onPick$ }) => {
    const { Modal, show, hide } = useModal({});

    // Single in-flight form state. Reset every time a new prompt is
    // chosen so stale values from a previously-cancelled prompt don't
    // leak across rows. Keyed by descriptor identity rather than by
    // name so two servers with the same prompt name still get clean
    // form state per row.
    const active = useStore<ActivePrompt>({
      descriptor: null,
      values: {},
      submitting: false,
      error: null,
    });

    const onRowClick$ = $(async (descriptor: ElmAgUiPromptDescriptor) => {
      const args = descriptor.arguments ?? [];
      if (args.length === 0) {
        // No-arg prompts: dispatch immediately, no modal.
        await onPick$(descriptor.key, {});
        return;
      }
      const initial: Record<string, string> = {};
      for (const a of args) initial[a.name] = "";
      active.descriptor = descriptor;
      active.values = initial;
      active.submitting = false;
      active.error = null;
      show();
    });

    const onCancel$ = $(() => {
      hide();
      active.error = null;
    });

    const onSubmit$ = $(async () => {
      const descriptor = active.descriptor;
      if (!descriptor) return;
      const args = descriptor.arguments ?? [];
      // Surface a single missing-required error rather than per-field
      // validation; keeps the modal lightweight.
      for (const a of args) {
        if (a.required && !(active.values[a.name] ?? "").trim()) {
          active.error = `"${a.name}" is required.`;
          return;
        }
      }
      active.error = null;
      active.submitting = true;
      try {
        await onPick$(descriptor.key, { ...active.values });
        hide();
      } catch (err) {
        active.error = err instanceof Error ? err.message : String(err);
      } finally {
        active.submitting = false;
      }
    });

    return (
      <>
        <div class={[styles.panel, className]} style={style}>
          {prompts.length === 0 ? (
            <div class={styles.empty}>No prompts available.</div>
          ) : (
            prompts.map((p) => (
              <div
                key={p.key}
                class={styles["prompt-row"]}
                onClick$={() => onRowClick$(p)}
              >
                <div class={styles["prompt-head"]}>
                  <span class={styles["prompt-name"]}>{p.name}</span>
                </div>
                {p.description && (
                  <span class={styles["prompt-description"]}>
                    {p.description}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <Modal>
          <div class={styles["modal-card"]}>
            {active.descriptor && (
              <>
                <div class={styles["modal-header"]}>
                  <span class={styles["modal-title"]}>
                    {active.descriptor.name}
                  </span>
                  {active.descriptor.description && (
                    <span class={styles["modal-description"]}>
                      {active.descriptor.description}
                    </span>
                  )}
                </div>

                <div class={styles.form}>
                  {(active.descriptor.arguments ?? []).map((a) => (
                    <label key={a.name} class={styles["field-label"]}>
                      <span class={styles["field-name"]}>
                        {a.name}
                        {a.required && (
                          <span class={styles["field-required"]}>*</span>
                        )}
                      </span>
                      <input
                        class={styles["field-input"]}
                        type="text"
                        placeholder={a.description}
                        value={active.values[a.name] ?? ""}
                        aria-required={a.required}
                        onInput$={(_, el: HTMLInputElement) => {
                          active.values[a.name] = el.value;
                        }}
                      />
                    </label>
                  ))}
                  {active.error && (
                    <div class={styles.error}>{active.error}</div>
                  )}
                </div>

                <div class={styles["form-actions"]}>
                  <button
                    type="button"
                    class={styles["cancel-button"]}
                    onClick$={onCancel$}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class={styles["use-button"]}
                    disabled={active.submitting}
                    onClick$={onSubmit$}
                  >
                    {active.submitting ? "Resolving…" : "Use prompt"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </>
    );
  },
);
