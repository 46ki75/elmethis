import { createSignal, omit, onSettled } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import { mergeStyle } from "../../styles/merge-style";
import styles from "./elm-page-top.module.css";

export interface ElmPageTopProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "aria-hidden"
> {
  tabIndex?: number | string;
  "aria-hidden"?: boolean | "true" | "false";
  /** Specifies the position of the button. */
  position?: "left" | "right";
}

export const ElmPageTop = (props: ElmPageTopProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "position",
    "onClick",
    "onKeyDown",
    "role",
    "aria-hidden",
    "tabindex",
    "tabIndex",
  );
  const [isVisible, setIsVisible] = createSignal(false);

  onSettled(() => {
    const checkScroll = () => setIsVisible(window.scrollY > 100);

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener("scroll", checkScroll);
  });

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleClick: JSX.EventHandler<HTMLElement, MouseEvent> = (event) => {
    toTop();

    const handler = props.onClick;
    if (typeof handler === "function") {
      handler(event);
    } else {
      handler?.[0](handler[1], event);
    }
  };

  const handleKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (
    event,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toTop();
    }

    const handler = props.onKeyDown;
    if (typeof handler === "function") {
      handler(event);
    } else {
      handler?.[0](handler[1], event);
    }
  };

  return (
    <nav
      class={clsx(
        styles["elm-page-top"],
        isVisible() && styles.visible,
        props.class,
      )}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-size": "64px",
        left: props.position === "left" ? "0" : "auto",
        right: (props.position ?? "right") === "right" ? "0" : "auto",
      })}
      role={props.role ?? "button"}
      aria-hidden={`${props["aria-hidden"] ?? !isVisible()}`}
      tabindex={isVisible() ? (props.tabindex ?? props.tabIndex ?? 0) : -1}
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
