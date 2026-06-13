import {
  computed,
  defineComponent,
  type Component,
  type CSSProperties,
  type StyleValue,
} from "vue";
import { clsx } from "clsx";
import {
  useClipboard as useVueClipboard,
  useClipboardItems,
} from "@vueuse/core";
import { mdiClipboardCheckOutline, mdiClipboardOutline } from "@mdi/js";

import { ElmMdiIcon } from "../components/icon/elm-mdi-icon";
import styles from "./use-clipboard.module.css";

type ClipboardItemParameter = ConstructorParameters<typeof ClipboardItem>[0];

export interface UseClipboardOptions {
  class?: string;

  style?: CSSProperties;

  content: string | ClipboardItemParameter[];

  delay?: number;
}

/**
 * Vue port of qwik's `useClipboard`. Returns a `copy` callback and a
 * `CopyButton` component whose icon swaps to the check variant for `delay` ms
 * after a successful copy.
 *
 * Official-first: the copy + auto-resetting `copied` state come from `@vueuse`
 * (`useClipboard` for text, `useClipboardItems` for rich `ClipboardItem[]`),
 * which also handles the "re-press cancels the previous reset" timer. `copied`
 * merges both paths.
 */
export const useClipboard = (
  options: UseClipboardOptions,
): { copy: () => Promise<void>; CopyButton: Component } => {
  const copiedDuring = options.delay ?? 1500;
  const textClip = useVueClipboard({ copiedDuring });
  const itemsClip = useClipboardItems({ copiedDuring });

  // Flips for whichever path performed the write; both auto-reset after
  // `copiedDuring` ms.
  const copied = computed(
    () => textClip.copied.value || itemsClip.copied.value,
  );

  const copy = async (): Promise<void> => {
    const content = options.content;
    if (typeof content === "string") {
      await textClip.copy(content);
    } else {
      await itemsClip.copy(content.map((item) => new ClipboardItem(item)));
    }
  };

  const CopyButton = defineComponent({
    name: "CopyButton",
    setup() {
      return () => (
        <span
          class={clsx(styles["use-clipboard"], options.class)}
          style={options.style as StyleValue}
          onClick={copy}
        >
          <ElmMdiIcon
            class={clsx(copied.value && styles["use-clipboard-icon-copied"])}
            d={copied.value ? mdiClipboardCheckOutline : mdiClipboardOutline}
            size="1.25rem"
          />
        </span>
      );
    },
  });

  return { copy, CopyButton };
};
