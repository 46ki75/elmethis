import type { CSSProperties } from "react";

import {
  useClipboard,
  type UseClipboardOptions,
} from "../../hooks/use-clipboard";

export interface ElmCopyIconProps {
  className?: string;

  style?: CSSProperties;

  content: UseClipboardOptions["content"];
}

export const ElmCopyIcon = ({
  className,
  style,
  content,
}: ElmCopyIconProps) => {
  const { CopyButton } = useClipboard({
    className,
    style,
    content,
  });

  return <CopyButton />;
};
