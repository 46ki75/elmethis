import { createSignal, onCleanup, type Accessor } from "solid-js";

export type ClipboardItemContent = ConstructorParameters<
  typeof ClipboardItem
>[0];

export type ClipboardContent = string | ClipboardItemContent[];

export interface CreateClipboardOptions {
  /** Text or ClipboardItem-compatible records to write. */
  content: ClipboardContent;

  /** How long the successful-copy state remains active. */
  delay?: number;
}

export interface ClipboardController {
  copied: Accessor<boolean>;
  copy: () => Promise<void>;
}

/** Creates an owner-scoped clipboard controller with successful-copy feedback. */
export function createClipboard(
  options: CreateClipboardOptions,
): ClipboardController {
  const [copied, setCopied] = createSignal(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  onCleanup(() => {
    disposed = true;
    if (resetTimer !== undefined) clearTimeout(resetTimer);
  });

  const copy = async (): Promise<void> => {
    const clipboard = globalThis.navigator?.clipboard;
    if (!clipboard) throw new Error("The Clipboard API is not available");

    const content = options.content;
    if (typeof content === "string") {
      if (!clipboard.writeText) {
        throw new Error("Clipboard text writes are not available");
      }
      await clipboard.writeText(content);
    } else {
      if (!clipboard.write || typeof ClipboardItem === "undefined") {
        throw new Error("Clipboard item writes are not available");
      }
      await clipboard.write(content.map((item) => new ClipboardItem(item)));
    }

    if (disposed) return;
    if (resetTimer !== undefined) clearTimeout(resetTimer);

    setCopied(true);
    resetTimer = setTimeout(() => {
      setCopied(false);
      resetTimer = undefined;
    }, options.delay ?? 1500);
  };

  return { copied, copy };
}
