import { component$, type CSSProperties } from "@qwik.dev/core";

import { useClipboard, UseClipboardOptions } from "../../hooks/use-clipboard";

export interface ElmCopyIconProps {
  class?: string;

  style?: CSSProperties;

  content: UseClipboardOptions["content"];
}

export const ElmCopyIcon = component$<ElmCopyIconProps>(
  ({ class: className, style, content }) => {
    const { CopyButton } = useClipboard({
      class: className,
      style: style,
      content: content,
    });

    return <CopyButton />;
  },
);
