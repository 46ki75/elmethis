import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-fragment-identifier.module.css";

export interface ElmFragmentIdentifierProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** ID of the heading element. */
  id: string;
}

export const ElmFragmentIdentifier = (props: ElmFragmentIdentifierProps) => {
  const rest = omit(props, "class", "id");

  const handleHashClick = () => {
    const url = new URL(window.location.href);
    url.hash = props.id;
    window.history.replaceState(null, "", url.toString());

    document.getElementById(props.id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <span
      class={clsx(styles["elm-fragment-identifier"], props.class)}
      onClick={handleHashClick}
      {...rest}
    >
      #
    </span>
  );
};
