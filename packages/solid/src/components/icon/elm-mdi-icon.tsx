import { mergeProps, Show, splitProps, type JSX } from "solid-js";
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
  const merged = mergeProps({ size: "1em" }, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "path",
    "size",
    "color",
    "label",
  ]);
  const hasAccessibleName = () =>
    Boolean(local.label || rest["aria-label"] || rest["aria-labelledby"]);

  return (
    <svg
      class={clsx(styles["elm-mdi-icon"], local.class)}
      style={local.style}
      width={local.size}
      height={local.size}
      viewBox="0 0 24 24"
      color={local.color}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={hasAccessibleName() ? undefined : "true"}
      role={hasAccessibleName() ? "img" : undefined}
      {...NON_FOCUSABLE}
      {...rest}
    >
      <Show when={local.label}>{(label) => <title>{label()}</title>}</Show>
      <path d={local.path} />
    </svg>
  );
};
