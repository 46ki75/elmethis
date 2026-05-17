import { $, component$, useSignal, type CSSProperties } from "@qwik.dev/core";

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

  const copy = $(async () => {
    if (typeof options.content === "string") {
      await window.navigator.clipboard.writeText(options.content);
    } else {
      await window.navigator.clipboard.write(
        options.content.map((item) => new ClipboardItem(item)),
      );
    }
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
