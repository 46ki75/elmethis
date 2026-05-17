import {
  $,
  component$,
  useComputed$,
  useSignal,
  type CSSProperties,
  type QRL,
} from "@qwik.dev/core";
import type { InputContent } from "@ag-ui/client";

import styles from "./elm-ag-ui-input.module.css";
import textStyle from "../../styles/text.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiClose, mdiPlus, mdiSend, mdiStop } from "@mdi/js";
import {
  ElmAgUiPromptPicker,
  type ElmAgUiPromptDescriptor,
} from "./elm-ag-ui-prompt-picker";
import { ElmCollapse } from "../containments/elm-collapse";

export interface ElmAgUiInputProps {
  class?: string;

  style?: CSSProperties;

  isRunning: boolean;

  onInput$: QRL<(event: InputEvent, element: HTMLTextAreaElement) => void>;

  onSubmit$: QRL<(event: Event, element: Element) => void>;

  onAbort$: QRL<() => void>;

  /**
   * Optional list of prompts surfaced via a "+" button to the left of
   * the textarea. When the array is non-empty (or undefined-but-the
   * `resolvePrompt$` handler is provided), the toggle is shown and
   * clicking it expands a picker panel above the input.
   *
   * Pass an empty array to hide the toggle entirely. The descriptor
   * shape is intentionally generic — see
   * `useMcpPrompts` for the MCP-flavored mapping.
   */
  prompts?: ElmAgUiPromptDescriptor[];

  /**
   * Called when the user picks a prompt from the panel. Should resolve
   * the chosen prompt (by `key`) with the supplied argument values and
   * return its content as `InputContent[]`. The text blocks of the
   * returned content are inserted at the textarea's current cursor
   * position; the user can then edit and submit manually rather than
   * having the prompt fire instantly.
   *
   * Return `null` (or an array with no text blocks) to do nothing —
   * useful for "resolve failed" / "server returned no text" cases.
   */
  resolvePrompt$?: QRL<
    (
      key: string,
      args: Record<string, string>,
    ) => Promise<InputContent[] | null>
  >;
}

export const ElmAgUiInput = component$<ElmAgUiInputProps>(
  ({
    class: className,
    style,
    isRunning,
    onInput$,
    onSubmit$,
    onAbort$,
    prompts,
    resolvePrompt$,
  }) => {
    const textAreaRef = useSignal<HTMLTextAreaElement>();
    const isPickerOpen = useSignal<boolean>(false);

    // Slash mode: when the user types `/` in the textarea, scan back
    // from the caret. If the current word starts with `/`, treat the
    // [slash, caret] substring as a live query that filters the picker
    // and gets replaced when a row is chosen.
    const slashRange = useSignal<{ start: number; end: number } | null>(null);
    const slashQuery = useSignal<string>("");
    const activeIndex = useSignal<number>(0);
    // Trigger channel into the picker: setting this signal to a
    // descriptor makes the picker run its row-click flow (modal for
    // arg prompts, immediate pick for no-arg). The picker resets it
    // to `null` after handling.
    const triggerDescriptor = useSignal<ElmAgUiPromptDescriptor | null>(null);

    const onSubmit = $((event: Event, element: Element) => {
      onSubmit$(event, element);
      if (textAreaRef.value) {
        textAreaRef.value.value = "";
        // Reset the auto-grown height — without this the textarea
        // would stay tall after sending a long message.
        textAreaRef.value.style.height = "auto";
      }
    });

    // Picker visible only when both data and handler are supplied —
    // either alone signals an unfinished wiring on the parent's part
    // and would render a useless toggle. Only referenced in render
    // (JSX is part of the host component's $-scope and tolerates the
    // QRL-mixed `&&` result); child QRLs gate on the individual
    // signals directly to avoid Qwik's lexical-scope analyzer
    // complaint about this composite value.
    const hasPicker = prompts !== undefined && resolvePrompt$ !== undefined;

    // Filter rows by the slash query when slash mode is active.
    // Plain "+" mode (slashRange == null + empty query) returns all
    // rows, preserving today's behavior.
    const filteredPrompts = useComputed$<ElmAgUiPromptDescriptor[]>(() => {
      const q = slashQuery.value.trim().toLowerCase();
      const all = prompts ?? [];
      if (!q) return all;
      return all.filter((p) => p.name.toLowerCase().includes(q));
    });

    const onPickPrompt = $(
      async (key: string, args: Record<string, string>) => {
        if (!resolvePrompt$) return;
        const content = await resolvePrompt$(key, args);
        const text = (content ?? [])
          .filter((c): c is { type: "text"; text: string } => c.type === "text")
          .map((c) => c.text)
          .join("\n\n");
        if (!text) {
          // Server returned nothing usable — leave the textarea
          // untouched but close both modes so the user can re-try.
          isPickerOpen.value = false;
          slashRange.value = null;
          slashQuery.value = "";
          return;
        }

        const ta = textAreaRef.value;
        if (ta) {
          // Slash mode overrides the cursor splice: replace the typed
          // `/query` substring so the user doesn't have to clean it
          // up. Otherwise fall back to the textarea's current cursor /
          // selection.
          const range = slashRange.value;
          const start = range?.start ?? ta.selectionStart ?? ta.value.length;
          const end = range?.end ?? ta.selectionEnd ?? ta.value.length;
          const before = ta.value.slice(0, start);
          const after = ta.value.slice(end);
          const inserted = before + text + after;
          ta.value = inserted;
          const caret = start + text.length;
          ta.focus();
          ta.setSelectionRange(caret, caret);
          // The textarea's listener-driven onInput$ only fires for
          // user-typed keystrokes; programmatic `ta.value = ...` is
          // silent. Dispatch a bubbling input event so the parent's
          // input-signal mirror updates and the submit path sees the
          // new text.
          ta.dispatchEvent(new Event("input", { bubbles: true }));
        }

        isPickerOpen.value = false;
        slashRange.value = null;
        slashQuery.value = "";
      },
    );

    // Re-evaluate slash mode against the textarea's current value and
    // caret. Called from both the wrapped onInput$ and the synthetic
    // input event the pick handler dispatches.
    const detectSlash = $((ta: HTMLTextAreaElement) => {
      const caret = ta.selectionStart ?? ta.value.length;
      const value = ta.value;
      let i = caret - 1;
      // Walk back to the start of the current word.
      while (i >= 0 && !/\s/.test(value[i] ?? "")) i--;
      // i+1 is the first non-whitespace char before caret (or 0 at BOF).
      if (value[i + 1] === "/") {
        slashRange.value = { start: i + 1, end: caret };
        slashQuery.value = value.slice(i + 2, caret);
        activeIndex.value = 0;
      } else {
        slashRange.value = null;
        slashQuery.value = "";
      }
    });

    // Auto-grow the textarea height to fit its content. Two-step
    // assignment is required: setting `height = "auto"` first lets
    // the next read of `scrollHeight` reflect the natural content
    // height (otherwise it keeps reporting whatever we last set).
    // The CSS `max-height` caps it; once exceeded, vertical scroll
    // kicks in (`overflow-y: auto`).
    const autoGrow$ = $((element: HTMLTextAreaElement) => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    });

    const handleInput$ = $(
      async (event: InputEvent, element: HTMLTextAreaElement) => {
        await autoGrow$(element);
        await detectSlash(element);
        await onInput$(event, element);
      },
    );

    // Sync handler — keystroke suppression doesn't depend on async
    // work. The `qwik/no-async-prevent-default` rule pattern-matches
    // any `event.preventDefault()` inside a `$()` boundary regardless
    // of whether the body is async, and the recommended attribute
    // alternative (`preventdefault:keydown`) is unconditional and
    // would block normal typing. Rule disabled at function scope.
    /* eslint-disable qwik/no-async-prevent-default */
    const handleKeyDown$ = $(
      (event: KeyboardEvent, _element: HTMLTextAreaElement) => {
        // Gate on `slashRange` only — slash mode can only have been
        // activated when prompts were defined, so the per-key
        // list-length checks below cover the "no picker wired" case.
        if (slashRange.value === null) return;
        const list = filteredPrompts.value;
        if (event.key === "ArrowDown") {
          if (list.length === 0) return;
          event.preventDefault();
          activeIndex.value = (activeIndex.value + 1) % list.length;
        } else if (event.key === "ArrowUp") {
          if (list.length === 0) return;
          event.preventDefault();
          activeIndex.value =
            (activeIndex.value - 1 + list.length) % list.length;
        } else if (event.key === "Escape") {
          event.preventDefault();
          slashRange.value = null;
          slashQuery.value = "";
        } else if (event.key === "Enter") {
          if (list.length === 0) return;
          const chosen = list[Math.min(activeIndex.value, list.length - 1)];
          event.preventDefault();
          // Route both no-arg and arg-bearing prompts through the
          // picker's trigger signal — it does the right thing for
          // each case (immediate pick vs modal open). Keeps the
          // modal-control logic in one place.
          triggerDescriptor.value = chosen;
        }
      },
    );
    /* eslint-enable qwik/no-async-prevent-default */

    return (
      <div class={[styles["elm-ag-ui-input-wrapper"], className]} style={style}>
        <ElmCollapse
          isOpen={
            hasPicker && (isPickerOpen.value || slashRange.value !== null)
          }
          class={styles["picker-container"]}
        >
          <ElmAgUiPromptPicker
            prompts={
              slashRange.value !== null
                ? filteredPrompts.value
                : (prompts ?? [])
            }
            onPick$={onPickPrompt}
            activeIndex={
              slashRange.value !== null ? activeIndex.value : undefined
            }
            triggerDescriptor={triggerDescriptor}
          />
        </ElmCollapse>

        <div class={[styles["elm-ag-ui-input"], textStyle["text"]]}>
          <textarea
            ref={textAreaRef}
            name="prompt"
            aria-label="Prompt"
            class={styles["input"]}
            onInput$={handleInput$}
            onKeyDown$={handleKeyDown$}
          />

          <div class={styles["button-row"]}>
            {hasPicker && (
              <div
                class={styles["plus-button"]}
                // mousedown happens before the button steals focus;
                // preventing its default keeps the textarea focused
                // throughout the open/close toggle so the caret stays
                // visible and the current selection (the insert site)
                // is preserved.
                onMouseDown$={(event) => event.preventDefault()}
                onClick$={() => {
                  const willOpen = !isPickerOpen.value;
                  isPickerOpen.value = willOpen;
                  // If the textarea has never been focused, the
                  // mousedown preventDefault above has nothing to
                  // preserve — focus it explicitly on open so the
                  // user sees where an inserted prompt will land.
                  if (willOpen) textAreaRef.value?.focus();
                }}
                aria-label={
                  isPickerOpen.value ? "Close prompts" : "Open prompts"
                }
              >
                <ElmMdiIcon
                  d={isPickerOpen.value ? mdiClose : mdiPlus}
                  size="1rem"
                  color="white"
                />
              </div>
            )}

            <div
              class={styles["submit-button"]}
              onClick$={isRunning ? onAbort$ : onSubmit}
            >
              <ElmMdiIcon
                d={isRunning ? mdiStop : mdiSend}
                size="1rem"
                color="white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
