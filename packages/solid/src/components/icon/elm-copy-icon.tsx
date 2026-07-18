import { splitProps, type JSX } from "solid-js";
import { mdiClipboardCheckOutline, mdiClipboardOutline } from "@mdi/js";
import { clsx } from "clsx";

import {
  createClipboard,
  type ClipboardContent,
} from "../../primitives/create-clipboard";
import { ElmMdiIcon } from "./elm-mdi-icon";
import styles from "./elm-copy-icon.module.css";

export interface ElmCopyIconProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  content: ClipboardContent;
}

export const ElmCopyIcon = (props: ElmCopyIconProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "content",
    "onClick",
    "type",
    "aria-label",
  ]);
  const clipboard = createClipboard({
    get content() {
      return local.content;
    },
  });

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    void clipboard.copy().catch(() => undefined);

    const handler = local.onClick;
    if (typeof handler === "function") handler(event);
    else handler?.[0](handler[1], event);
  };

  return (
    <button
      type={local.type ?? "button"}
      class={clsx(styles["elm-copy-icon"], local.class)}
      style={local.style}
      aria-label={
        local["aria-label"] ??
        (clipboard.copied() ? "Copied" : "Copy to clipboard")
      }
      onClick={handleClick}
      {...rest}
    >
      <ElmMdiIcon
        aria-hidden="true"
        role="presentation"
        class={clsx(clipboard.copied() && styles["elm-copy-icon-copied"])}
        d={clipboard.copied() ? mdiClipboardCheckOutline : mdiClipboardOutline}
        size="1.25rem"
      />
    </button>
  );
};
