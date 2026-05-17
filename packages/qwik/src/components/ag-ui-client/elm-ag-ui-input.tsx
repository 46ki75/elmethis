import {
  $,
  component$,
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

    const onSubmit = $((event: Event, element: Element) => {
      onSubmit$(event, element);
      if (textAreaRef.value) {
        textAreaRef.value.value = "";
      }
    });

    // Picker visible only when both data and handler are supplied —
    // either alone signals an unfinished wiring on the parent's part
    // and would render a useless toggle.
    const hasPicker = prompts !== undefined && resolvePrompt$ !== undefined;

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
          // untouched but close the picker so the user can re-try.
          isPickerOpen.value = false;
          return;
        }

        const ta = textAreaRef.value;
        if (ta) {
          // Insert at the textarea's current cursor / selection. If
          // the textarea has never been focused, selectionStart is 0
          // and the prompt lands at the beginning — fine for the
          // empty-textarea case.
          const start = ta.selectionStart ?? ta.value.length;
          const end = ta.selectionEnd ?? ta.value.length;
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
      },
    );

    return (
      <div class={[styles["elm-ag-ui-input-wrapper"], className]} style={style}>
        {hasPicker && isPickerOpen.value && (
          <div class={styles["picker-container"]}>
            <ElmAgUiPromptPicker
              prompts={prompts ?? []}
              onPick$={onPickPrompt}
            />
          </div>
        )}

        <div class={[styles["elm-ag-ui-input"], textStyle["text"]]}>
          {hasPicker && (
            <div
              class={styles["plus-button"]}
              // mousedown happens before the button steals focus; preventing
              // its default keeps the textarea focused throughout the
              // open/close toggle so the caret stays visible and the
              // current selection (the insert site) is preserved.
              onMouseDown$={(event) => event.preventDefault()}
              onClick$={() => {
                const willOpen = !isPickerOpen.value;
                isPickerOpen.value = willOpen;
                // If the textarea has never been focused, the mousedown
                // preventDefault above has nothing to preserve — focus it
                // explicitly on open so the user sees where an inserted
                // prompt will land.
                if (willOpen) textAreaRef.value?.focus();
              }}
              aria-label={isPickerOpen.value ? "Close prompts" : "Open prompts"}
            >
              <ElmMdiIcon
                d={isPickerOpen.value ? mdiClose : mdiPlus}
                size="1.25rem"
                color="white"
              />
            </div>
          )}

          <textarea
            ref={textAreaRef}
            class={styles["input"]}
            onInput$={onInput$}
          />

          <div
            class={[styles["submit-button"]]}
            onClick$={isRunning ? onAbort$ : onSubmit}
          >
            <ElmMdiIcon
              d={isRunning ? mdiStop : mdiSend}
              size="1.5rem"
              color="white"
            />
          </div>
        </div>
      </div>
    );
  },
);
