import {
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";

import { mergeStyle } from "../../styles/merge-style";
import styles from "./elm-page-top.module.css";

export interface ElmPageTopProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Specifies the position of the button. */
  position?: "left" | "right";
}

export const ElmPageTop = (props: ElmPageTopProps) => {
  const merged = mergeProps({ position: "right" as const }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "position",
    "onClick",
    "onKeyDown",
    "role",
    "aria-hidden",
    "tabindex",
    "tabIndex",
  ]);
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    const checkScroll = () => setIsVisible(window.scrollY > 100);

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    onCleanup(() => window.removeEventListener("scroll", checkScroll));
  });

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleClick: JSX.EventHandler<HTMLElement, MouseEvent> = (event) => {
    toTop();

    const handler = local.onClick;
    if (typeof handler === "function") handler(event);
    else handler?.[0](handler[1], event);
  };

  const handleKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (
    event,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toTop();
    }

    const handler = local.onKeyDown;
    if (typeof handler === "function") handler(event);
    else handler?.[0](handler[1], event);
  };

  return (
    <nav
      class={clsx(
        styles["elm-page-top"],
        isVisible() && styles.visible,
        local.class,
      )}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-size": "64px",
        left: local.position === "left" ? "0" : "auto",
        right: local.position === "right" ? "0" : "auto",
      })}
      role={local.role ?? "button"}
      aria-hidden={local["aria-hidden"] ?? !isVisible()}
      tabindex={isVisible() ? (local.tabindex ?? local.tabIndex ?? 0) : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div aria-hidden="true" class={styles.partial} />
      <div aria-hidden="true" class={styles.partial} />
      <div aria-hidden="true" class={styles.partial} />
      <span class={styles.text}>Back to Top</span>
    </nav>
  );
};
