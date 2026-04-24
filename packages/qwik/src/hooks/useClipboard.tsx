import { $, component$, useSignal, type CSSProperties } from "@builder.io/qwik";

import styles from "./useClipboard.module.css";

import { ElmMdiIcon } from "../components/icon/elm-mdi-icon";
import { mdiClipboardCheckOutline, mdiClipboardOutline } from "@mdi/js";

export interface UseClipboardOptions {
  class?: string;

  style?: CSSProperties;

  content: string;

  delay?: number;
}

export const useClipboard = (options: UseClipboardOptions) => {
  const copied = useSignal(false);

  const copy = $(async () => {
    await window.navigator.clipboard.writeText(options.content);
    copied.value = true;

    setTimeout(() => {
      copied.value = false;
    }, options.delay ?? 1500);
  });

  const CopyButton = component$(() => {
    return (
      <span
        class={[styles["use-clipboard"], options.class]}
        style={options.style}
        onClick$={copy}
      >
        <ElmMdiIcon
          d={copied.value ? mdiClipboardCheckOutline : mdiClipboardOutline}
          color={copied.value ? "#cdb57b" : undefined}
          size="1.25rem"
        />
      </span>
    );
  });

  return {
    CopyButton,
    copy,
  };
};
