import { createMemo, createSignal, Show, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { mdiClose, mdiPlus, mdiSend, mdiStop } from "@mdi/js";
import type { InputContent } from "@ag-ui/client";

import type {
  AgentActivity,
  AgentRunStatus,
} from "../internal/create-agent-subscriber";
import { ElmCollapse } from "../../containments/elm-collapse";
import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import textStyle from "../../../styles/text.module.css";
import {
  ElmAgUiPromptPicker,
  type ElmAgUiPromptDescriptor,
} from "./elm-ag-ui-prompt-picker";
import { ElmAgUiStatus } from "./elm-ag-ui-status";
import styles from "./elm-ag-ui-input.module.css";

export interface ElmAgUiInputProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onInput" | "onSubmit"
> {
  isRunning: boolean;
  status?: AgentRunStatus;
  activity?: AgentActivity;
  onInputChange: (event: InputEvent, element: HTMLTextAreaElement) => void;
  onSubmit: () => void;
  onAbort: () => void;
  prompts?: ElmAgUiPromptDescriptor[];
  resolvePrompt?: (
    key: string,
    args: Record<string, string>,
  ) => Promise<InputContent[] | null>;
}

export const ElmAgUiInput = (props: ElmAgUiInputProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "isRunning",
    "status",
    "activity",
    "onInputChange",
    "onSubmit",
    "onAbort",
    "prompts",
    "resolvePrompt",
  ]);
  let textAreaRef!: HTMLTextAreaElement;
  const [isPickerOpen, setIsPickerOpen] = createSignal(false);
  const [slashRange, setSlashRange] = createSignal<{
    start: number;
    end: number;
  } | null>(null);
  const [slashQuery, setSlashQuery] = createSignal("");
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [triggerDescriptor, setTriggerDescriptor] =
    createSignal<ElmAgUiPromptDescriptor | null>(null);
  const hasPicker = () =>
    local.prompts !== undefined && local.resolvePrompt !== undefined;
  const filteredPrompts = createMemo(() => {
    const query = slashQuery().trim().toLowerCase();
    const prompts = local.prompts ?? [];
    return query
      ? prompts.filter((prompt) => prompt.name.toLowerCase().includes(query))
      : prompts;
  });

  const resetPicker = () => {
    setIsPickerOpen(false);
    setSlashRange(null);
    setSlashQuery("");
  };
  const pickPrompt = async (key: string, args: Record<string, string>) => {
    const content = await local.resolvePrompt?.(key, args);
    const text = (content ?? [])
      .filter(
        (item): item is { type: "text"; text: string } => item.type === "text",
      )
      .map((item) => item.text)
      .join("\n\n");
    if (!text) {
      resetPicker();
      return;
    }
    if (textAreaRef) {
      const range = slashRange();
      const start = range?.start ?? textAreaRef.selectionStart;
      const end = range?.end ?? textAreaRef.selectionEnd;
      textAreaRef.value =
        textAreaRef.value.slice(0, start) + text + textAreaRef.value.slice(end);
      const caret = start + text.length;
      textAreaRef.focus();
      textAreaRef.setSelectionRange(caret, caret);
      textAreaRef.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
    resetPicker();
  };

  const detectSlash = (element: HTMLTextAreaElement) => {
    const caret = element.selectionStart;
    let index = caret - 1;
    while (index >= 0 && !/\s/.test(element.value[index] ?? "")) index -= 1;
    if (element.value[index + 1] === "/") {
      setSlashRange({ start: index + 1, end: caret });
      setSlashQuery(element.value.slice(index + 2, caret));
      setActiveIndex(0);
    } else {
      setSlashRange(null);
      setSlashQuery("");
    }
  };

  const handleInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent> = (
    event,
  ) => {
    const element = event.currentTarget;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
    detectSlash(element);
    local.onInputChange(event, element);
  };
  const handleKeyDown: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent> = (
    event,
  ) => {
    if (slashRange() === null) return;
    const prompts = filteredPrompts();
    if (event.key === "ArrowDown" && prompts.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % prompts.length);
    } else if (event.key === "ArrowUp" && prompts.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + prompts.length) % prompts.length);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setSlashRange(null);
      setSlashQuery("");
    } else if (event.key === "Enter" && prompts.length > 0) {
      event.preventDefault();
      setTriggerDescriptor(
        prompts[Math.min(activeIndex(), prompts.length - 1)],
      );
    }
  };
  const submit = () => {
    local.onSubmit();
    if (textAreaRef) {
      textAreaRef.value = "";
      textAreaRef.style.height = "auto";
    }
  };

  return (
    <div {...rest} class={clsx(styles["elm-ag-ui-input"], local.class)}>
      <ElmCollapse
        direction="column"
        isOpen={hasPicker() && (isPickerOpen() || slashRange() !== null)}
        class={styles["picker-container"]}
      >
        <ElmAgUiPromptPicker
          prompts={
            slashRange() !== null ? filteredPrompts() : (local.prompts ?? [])
          }
          onPick={pickPrompt}
          activeIndex={slashRange() !== null ? activeIndex() : undefined}
          triggerDescriptor={triggerDescriptor}
          clearTriggerDescriptor={() => setTriggerDescriptor(null)}
        />
      </ElmCollapse>
      <div class={clsx(styles.card, textStyle.text)}>
        <textarea
          ref={(element) => {
            textAreaRef = element;
          }}
          name="prompt"
          aria-label="Prompt"
          class={styles.input}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <div class={styles["button-row"]}>
          <Show when={hasPicker()}>
            <button
              type="button"
              class={styles["plus-button"]}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const next = !isPickerOpen();
                setIsPickerOpen(next);
                if (next) textAreaRef?.focus();
              }}
              aria-label={isPickerOpen() ? "Close prompts" : "Open prompts"}
            >
              <ElmMdiIcon
                d={isPickerOpen() ? mdiClose : mdiPlus}
                size="1rem"
                color="white"
              />
            </button>
          </Show>
          <Show
            when={
              local.status === "running" || local.status === "awaiting_input"
            }
          >
            <ElmAgUiStatus
              class={styles.status}
              status={local.status ?? "idle"}
              activity={local.activity}
            />
          </Show>
          <Show when={local.isRunning}>
            <button
              type="button"
              class={styles["stop-button"]}
              onClick={() => local.onAbort()}
              aria-label="Stop"
            >
              <ElmMdiIcon d={mdiStop} size="1rem" color="white" />
            </button>
          </Show>
          <button
            type="button"
            class={styles["submit-button"]}
            onClick={submit}
            aria-label="Send"
          >
            <ElmMdiIcon d={mdiSend} size="1rem" color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};
