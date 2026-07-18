import type { JSX } from "solid-js";

export const callEventHandler = <T extends Element, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: E & { currentTarget: T; target: Element },
) => {
  if (typeof handler === "function") {
    handler(event);
  } else if (handler) {
    handler[0](handler[1], event);
  }
};
