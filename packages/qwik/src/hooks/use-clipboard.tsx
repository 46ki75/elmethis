import {
  $,
  component$,
  noSerialize,
  useSignal,
  useTask$,
  type CSSProperties,
  type NoSerialize,
} from "@qwik.dev/core";

import styles from "./use-clipboard.module.css";

import { ElmMdiIcon } from "../components/icon/elm-mdi-icon";
import { mdiClipboardCheckOutline, mdiClipboardOutline } from "@mdi/js";

export interface UseClipboardOptions {
  class?: string;

  style?: CSSProperties;

  content: string | ClipboardItemParameter[];

  delay?: number;
}

type ClipboardItemParameter = ConstructorParameters<typeof ClipboardItem>[0];

export const useClipboard = (options: UseClipboardOptions) => {
  const copied = useSignal(false);
  // Active reset timer. Re-pressing the copy button before the previous
  // reset fires must cancel the older timer — otherwise it would flip
  // `copied` back to false mid-way through the new feedback window.
  const resetTimerId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  // Unmount-only cleanup so a pending reset doesn't fire on a disposed host.
  useTask$(({ cleanup }) => {
    cleanup(() => {
      if (resetTimerId.value !== undefined) clearTimeout(resetTimerId.value);
    });
  });

  const copy = $(async () => {
    if (typeof options.content === "string") {
      await window.navigator.clipboard.writeText(options.content);
    } else {
      await window.navigator.clipboard.write(
        options.content.map((item) => new ClipboardItem(item)),
      );
    }

    // Cancel any in-flight reset before arming a new one.
    if (resetTimerId.value !== undefined) {
      clearTimeout(resetTimerId.value);
    }
    copied.value = true;
    resetTimerId.value = noSerialize(
      setTimeout(() => {
        copied.value = false;
        resetTimerId.value = undefined;
      }, options.delay ?? 1500),
    );
  });

  const CopyButton = component$(() => {
    return (
      <span
        class={[styles["use-clipboard"], options.class]}
        style={options.style}
        onClick$={copy}
      >
        <ElmMdiIcon
          class={[
            {
              [styles["use-clipboard-icon-copied"]]: copied.value,
            },
          ]}
          d={copied.value ? mdiClipboardCheckOutline : mdiClipboardOutline}
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
