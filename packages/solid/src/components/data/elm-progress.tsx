import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import { mergeStyle } from "../../styles/merge-style";

import styles from "./elm-progress.module.css";

export type ElmProgressProps = JSX.HTMLAttributes<HTMLProgressElement> & {
  /** The positive total amount of work. */
  max: number;
  /** The amount completed, from zero to max. */
  value: number;
  /** The height of the progress bar. Defaults to 8px. */
  weight?: JSX.CSSProperties["height"];
  /** The color of the filled portion. */
  color: JSX.CSSProperties["background-color"];
  /** Animates changes to the filled portion. */
  transition?: boolean;
};

export const ElmProgress = (props: ElmProgressProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "max",
    "value",
    "weight",
    "color",
    "transition",
  );

  return (
    <progress
      {...rest}
      max={props.max}
      value={props.value}
      class={clsx(
        styles["elm-progress"],
        {
          [styles["transition-enabled"]]: props.transition,
        },
        props.class,
      )}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-color": props.color,
        "--elmethis-scoped-height": props.weight ?? "8px",
        "--elmethis-scoped-progress-max": props.max,
        "--elmethis-scoped-progress-value": props.value,
      })}
    />
  );
};
