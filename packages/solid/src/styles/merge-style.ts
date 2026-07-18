import type { JSX } from "solid-js";

type Style = JSX.CSSProperties | string | undefined;

export const mergeStyle = (
  style: Style,
  scopedStyle: JSX.CSSProperties,
): JSX.CSSProperties | string => {
  if (typeof style !== "string") {
    return { ...scopedStyle, ...(style ?? {}) };
  }

  const serializedScopedStyle = Object.entries(scopedStyle)
    .filter((entry) => entry[1] != null)
    .map(([name, value]) => `${name}:${String(value)}`)
    .join(";");

  return [serializedScopedStyle, style.trim()].filter(Boolean).join(";");
};
