import { defineComponent, h, type CSSProperties, type PropType } from "vue";

import {
  useClipboard,
  type UseClipboardOptions,
} from "../../hooks/use-clipboard";

export interface ElmCopyIconProps {
  content: UseClipboardOptions["content"];
}

export const ElmCopyIcon = defineComponent({
  name: "ElmCopyIcon",
  // class/style are forwarded into the clipboard CopyButton rather than onto a
  // root of our own, so attrs are read explicitly.
  inheritAttrs: false,
  props: {
    content: {
      type: [String, Array] as PropType<UseClipboardOptions["content"]>,
      required: true,
    },
  },
  setup(props, { attrs }) {
    const { CopyButton } = useClipboard({
      class: attrs.class as string | undefined,
      style: attrs.style as CSSProperties | undefined,
      content: props.content,
    });

    return () => h(CopyButton);
  },
});
