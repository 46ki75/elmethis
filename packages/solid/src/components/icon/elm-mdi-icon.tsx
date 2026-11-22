import { type JSX } from "@solidjs/web";
import { Show, omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-mdi-icon.module.css";

const NON_FOCUSABLE = {
  focusable: "false",
} as unknown as JSX.SvgSVGAttributes<SVGSVGElement>;

export type ElmMdiIconProps = Omit<
  JSX.SvgSVGAttributes<SVGSVGElement>,
  "children"
> & {
  path: string;
  size?: string | number;
  color?: string;
  label?: string;
};

export const ElmMdiIcon = (props: ElmMdiIconProps) => {
  const rest = omit(props, "class", "style", "path", "size", "color", "label");
  const hasAccessibleName = () =>
    Boolean(props.label || rest["aria-label"] || rest["aria-labelledby"]);

  return (
    <svg
      class={clsx(styles["elm-mdi-icon"], props.class)}
      style={props.style}
      width={props.size ?? "1em"}
      height={props.size ?? "1em"}
      viewBox="0 0 24 24"
      color={props.color}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={hasAccessibleName() ? undefined : "true"}
      role={hasAccessibleName() ? "img" : undefined}
      {...NON_FOCUSABLE}
      {...rest}
    >
      <Show when={props.label}>{(label) => <title>{label()}</title>}</Show>
      <path d={props.path} />
    </svg>
  );
};
