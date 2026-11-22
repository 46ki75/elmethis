import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
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
  const rest = omit(
    props,
    "class",
    "style",
    "content",
    "onClick",
    "type",
    "aria-label",
  );
  const clipboard = createClipboard({
    get content() {
      return props.content;
    },
  });

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    void clipboard.copy().catch(() => undefined);

    const handler = props.onClick;
    if (typeof handler === "function") {
      handler(event);
    } else {
      handler?.[0](handler[1], event);
    }
  };

  return (
    <button
      type={props.type ?? "button"}
      class={clsx(styles["elm-copy-icon"], props.class)}
      style={props.style}
      aria-label={
        props["aria-label"] ??
        (clipboard.copied() ? "Copied" : "Copy to clipboard")
      }
      onClick={handleClick}
      {...rest}
    >
      <ElmMdiIcon
        aria-hidden="true"
        role="presentation"
        class={clsx(clipboard.copied() && styles["elm-copy-icon-copied"])}
        path={
          clipboard.copied() ? mdiClipboardCheckOutline : mdiClipboardOutline
        }
        size="1.25rem"
      />
    </button>
  );
};
