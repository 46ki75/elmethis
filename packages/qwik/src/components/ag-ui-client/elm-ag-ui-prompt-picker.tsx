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
  arguments?: ElmAgUiPromptArgument[];
}

export interface ElmAgUiPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
  /**
   * Closed set of allowed values. When present, the picker renders a
   * `<select>` instead of a free-text input. Standard MCP
   * `prompts/list` does not carry this information — see the remarks
   * on `useMcpPrompts` for the spec limitation and the workaround
   * (populate this at the descriptor-mapping layer).
   */
  enum?: string[];
  /**
   * Optional ECMAScript regex source (no leading/trailing slashes)
   * that the value must match on submit. Empty optional values are
   * skipped — the regex only applies to values that are actually
   * sent. Mirrors `z.string().regex(...)` on the server.
   *
   * Stored as a string (not `RegExp`) so the descriptor stays Qwik-
   * serializable across the resume boundary.
   *
   * Standard MCP `prompts/list` does not carry this information —
   * see the remarks on `useMcpPrompts` for the spec limitation. When
   * absent, regex constraints fall back to server-side validation
   * and surface as raw Zod issues in the modal's error line.
   */
  pattern?: string;
  /**
   * Human-readable error to show when `pattern` fails. Falls back to
   * a generic "<name> is invalid." Used both for the picker's inline
   * error and the input's HTML5 `title` attribute.
   */
  patternMessage?: string;
  /**
   * Optional initial value. For enum arguments this should be one of
   * the listed values; for free-text it pre-fills the input. Useful
   * for surfacing a server-side default.
   */
  default?: string;
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
      for (const a of args) {
        // Prefer the descriptor's default; for enums with no default,
        // pre-select the first option so the submit path always has a
        // valid value (otherwise the select shows blank-by-default
        // which doesn't round-trip cleanly).
        initial[a.name] =
          a.default ?? (a.enum && a.enum.length > 0 ? a.enum[0] : "");
      }
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
      // Drop optional fields the user left blank (text inputs they
      // never typed in, or enums set back to "(none)"). MCP servers
      // typically validate optional args with Zod — an empty string
      // fails enum / min(1) parsers, while an omitted key satisfies
      // `.optional()`. The required-check above already enforces
      // presence for required fields, so we never strip those.
      const payload: Record<string, string> = {};
      for (const a of args) {
        const value = active.values[a.name] ?? "";
        if (a.required || value !== "") payload[a.name] = value;
      }
      // Regex check runs after the payload trim so optional blank
      // fields that were just dropped don't fail validation. Anchor
      // the source with `^...$` if the descriptor's pattern didn't
      // already — matches Zod's `.regex()` semantics (full-string).
      for (const a of args) {
        if (!a.pattern || payload[a.name] === undefined) continue;
        const source = /^\^|\$$/.test(a.pattern)
          ? a.pattern
          : `^(?:${a.pattern})$`;
        let re: RegExp;
        try {
          re = new RegExp(source);
        } catch {
          // Malformed descriptor — fail loud rather than silently
          // letting the value through and surprising the server.
          active.error = `"${a.name}" has an invalid pattern definition.`;
          return;
        }
        if (!re.test(payload[a.name])) {
          active.error =
            a.patternMessage ?? `"${a.name}" is invalid.`;
          return;
        }
      }
      active.error = null;
      active.submitting = true;
      try {
        await onPick$(descriptor.key, payload);
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
                      {a.enum && a.enum.length > 0 ? (
                        <select
                          class={styles["field-input"]}
                          value={active.values[a.name] ?? ""}
                          aria-required={a.required}
                          onChange$={(_, el: HTMLSelectElement) => {
                            active.values[a.name] = el.value;
                          }}
                        >
                          {/*
                            Optional args render an explicit "(none)"
                            entry mapped to the empty string so the
                            user can clear a previously-picked value.
                            Required args drop it so submit can't fall
                            into the missing-required error path with
                            an enum picked.
                          */}
                          {!a.required && <option value="">(none)</option>}
                          {a.enum.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          class={styles["field-input"]}
                          type="text"
                          placeholder={a.description}
                          value={active.values[a.name] ?? ""}
                          aria-required={a.required}
                          // Forward the regex source as the native
                          // `pattern` so the field also gets browser
                          // `:invalid` styling — useful when the user
                          // hasn't hit Submit yet. The picker still
                          // re-validates server-style on submit.
                          pattern={a.pattern}
                          title={a.patternMessage ?? a.description}
                          onInput$={(_, el: HTMLInputElement) => {
                            active.values[a.name] = el.value;
                          }}
                        />
                      )}
                      {a.enum && a.description && (
                        <span class={styles["field-hint"]}>
                          {a.description}
                        </span>
                      )}
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
