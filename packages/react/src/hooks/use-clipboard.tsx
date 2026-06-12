import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { clsx } from "clsx";
import { useCopyToClipboard } from "usehooks-ts";

import styles from "./use-clipboard.module.css";

import { ElmMdiIcon } from "../components/icon/elm-mdi-icon";
import { mdiClipboardCheckOutline, mdiClipboardOutline } from "@mdi/js";

type ClipboardItemParameter = ConstructorParameters<typeof ClipboardItem>[0];

export interface UseClipboardOptions {
  className?: string;

  style?: CSSProperties;

  content: string | ClipboardItemParameter[];

  delay?: number;
}

/**
 * React port of qwik's `useClipboard`. Returns a `copy` callback and a
 * `CopyButton` component whose icon swaps to the check variant for `delay`
 * ms after a successful copy.
 *
 * Text content is written via usehooks-ts `useCopyToClipboard`; rich
 * `ClipboardItem[]` content (which that hook does not support) is written
 * directly through `navigator.clipboard.write`.
 */
export const useClipboard = (options: UseClipboardOptions) => {
  const [copied, setCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  // Active reset timer. Re-pressing the copy button before the previous reset
  // fires must cancel the older timer — otherwise it would flip `copied` back
  // to false mid-way through the new feedback window.
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Keep the latest options available to the stable `copy` callback without
  // re-creating it on every render.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Unmount-only cleanup so a pending reset doesn't fire on a disposed host.
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== undefined) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const copy = useCallback(async () => {
    const { content, delay } = optionsRef.current;

    if (typeof content === "string") {
      await copyToClipboard(content);
    } else {
      await window.navigator.clipboard.write(
        content.map((item) => new ClipboardItem(item)),
      );
    }

    // Cancel any in-flight reset before arming a new one.
    if (resetTimerRef.current !== undefined) {
      clearTimeout(resetTimerRef.current);
    }
    setCopied(true);
    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = undefined;
    }, delay ?? 1500);
  }, [copyToClipboard]);

  const CopyButton = useCallback(() => {
    return (
      <span
        className={clsx(styles["use-clipboard"], options.className)}
        style={options.style}
        onClick={copy}
      >
        <ElmMdiIcon
          className={clsx(copied && styles["use-clipboard-icon-copied"])}
          d={copied ? mdiClipboardCheckOutline : mdiClipboardOutline}
          size="1.25rem"
        />
      </span>
    );
  }, [copied, copy, options.className, options.style]);

  return {
    CopyButton,
    copy,
  };
};
