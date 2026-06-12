import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import styles from "./elm-fragment-identifier.module.css";

export interface ElmFragmentIdentifierProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * ID of the heading element.
   */
  id: string;
}

export const ElmFragmentIdentifier = ({
  className,
  id,
  ...props
}: ElmFragmentIdentifierProps) => {
  const handleHashClick = (id: string) => {
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(null, "", url.toString());

    const target = document.getElementById(id);
    if (target != null) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <span
      className={clsx(styles["elm-fragment-identifier"], className)}
      onClick={() => handleHashClick(id)}
      {...props}
    >
      #
    </span>
  );
};
