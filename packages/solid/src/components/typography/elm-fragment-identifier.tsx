import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";

import styles from "./elm-fragment-identifier.module.css";

export interface ElmFragmentIdentifierProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** ID of the heading element. */
  id: string;
}

export const ElmFragmentIdentifier = (props: ElmFragmentIdentifierProps) => {
  const [local, rest] = splitProps(props, ["class", "id"]);

  const handleHashClick = () => {
    const url = new URL(window.location.href);
    url.hash = local.id;
    window.history.replaceState(null, "", url.toString());

    document.getElementById(local.id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <span
      class={clsx(styles["elm-fragment-identifier"], local.class)}
      onClick={handleHashClick}
      {...rest}
    >
      #
    </span>
  );
};
